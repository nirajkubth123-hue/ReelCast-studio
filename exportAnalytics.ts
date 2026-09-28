import { ScheduledPost } from '../types';

/**
 * Escapes CSV field text according to standard RFC 4180
 */
function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers download of CSV analytics report
 */
export function exportAnalyticsToCsv(posts: ScheduledPost[]) {
  const publishedPosts = posts.filter(p => p.status === 'published' && p.performance);

  const headers = [
    'Post ID',
    'Post Title',
    'Video Filename',
    'Published Date',
    'Target Platforms',
    'Total Reach',
    'Total Views',
    'Total Likes',
    'Total Comments',
    'Total Shares',
    'Engagement Rate (%)',
    'Avg Watch Duration (%)',
    'Instagram Reach',
    'Instagram Views',
    'Instagram Likes',
    'YouTube Reach',
    'YouTube Views',
    'YouTube Likes',
    'Facebook Reach',
    'Facebook Views',
    'Facebook Likes'
  ];

  const rows = publishedPosts.map(p => {
    const perf = p.performance!;
    const pm = perf.platformMetrics || {};

    return [
      escapeCsv(p.id),
      escapeCsv(p.title),
      escapeCsv(p.videoName),
      escapeCsv(p.createdAt),
      escapeCsv(p.platforms.join('; ')),
      escapeCsv(perf.totalReach),
      escapeCsv(perf.totalViews),
      escapeCsv(perf.totalLikes),
      escapeCsv(perf.totalComments),
      escapeCsv(perf.totalShares),
      escapeCsv(perf.engagementRate),
      escapeCsv(perf.avgWatchPercentage),
      escapeCsv(pm.instagram?.reach ?? 0),
      escapeCsv(pm.instagram?.views ?? 0),
      escapeCsv(pm.instagram?.likes ?? 0),
      escapeCsv(pm.youtube?.reach ?? 0),
      escapeCsv(pm.youtube?.views ?? 0),
      escapeCsv(pm.youtube?.likes ?? 0),
      escapeCsv(pm.facebook?.reach ?? 0),
      escapeCsv(pm.facebook?.views ?? 0),
      escapeCsv(pm.facebook?.likes ?? 0)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `reelcast-performance-analytics-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive print/PDF report of post performance analytics
 * Opens a beautifully formatted print dialog where user can save as PDF or print
 */
export function exportAnalyticsToPdf(posts: ScheduledPost[]) {
  const publishedPosts = posts.filter(p => p.status === 'published' && p.performance);

  // Aggregated totals
  let totalReach = 0;
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;

  publishedPosts.forEach(p => {
    if (p.performance) {
      totalReach += p.performance.totalReach;
      totalViews += p.performance.totalViews;
      totalLikes += p.performance.totalLikes;
      totalComments += p.performance.totalComments;
      totalShares += p.performance.totalShares;
    }
  });

  const avgEngagement = publishedPosts.length > 0
    ? (publishedPosts.reduce((acc, p) => acc + (p.performance?.engagementRate || 0), 0) / publishedPosts.length).toFixed(1)
    : '0';

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const rowsHtml = publishedPosts.map((p, idx) => {
    const perf = p.performance!;
    const pm = perf.platformMetrics || {};
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-weight: 600; color: #111827;">#${idx + 1} ${p.title}</td>
        <td style="padding: 10px 12px; color: #4b5563;">${p.createdAt}</td>
        <td style="padding: 10px 12px; text-transform: capitalize; color: #4b5563;">${p.platforms.join(', ')}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #2563eb;">${perf.totalReach.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #111827;">${perf.totalViews.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; color: #10b981;">${perf.totalLikes.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; color: #6366f1;">${perf.totalComments.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; color: #f59e0b;">${perf.totalShares.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #059669;">${perf.engagementRate}%</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reelcast Social Studio - Performance Report</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: letter landscape;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2f6f4f;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #14181f;
            margin: 0;
          }
          .brand-subtitle {
            font-size: 13px;
            color: #2f6f4f;
            font-weight: 600;
            margin-top: 2px;
          }
          .meta-info {
            text-align: right;
            font-size: 12px;
            color: #6b7280;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
          }
          .card-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            font-weight: 600;
          }
          .card-value {
            font-size: 20px;
            font-weight: 800;
            margin-top: 4px;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 12px;
          }
          th {
            background: #f3f4f6;
            padding: 10px 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
          }
          th.right {
            text-align: right;
          }
          .footer {
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            color: #9ca3af;
            font-size: 11px;
          }
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #065f46; font-weight: 600;">Ready to save or print! Select "Save as PDF" in your print destination dialog.</span>
          <button onclick="window.print()" style="background: #2f6f4f; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">
            Print / Save to PDF
          </button>
        </div>

        <div class="header">
          <div>
            <h1 class="brand-title">Reelcast Social Studio</h1>
            <div class="brand-subtitle">Cross-Platform Video Performance Analytics Report</div>
          </div>
          <div class="meta-info">
            <div><strong>Report Date:</strong> ${reportDate}</div>
            <div><strong>Published Posts:</strong> ${publishedPosts.length}</div>
            <div><strong>Status:</strong> Live Connected Sync</div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div class="card-label">Total Reach</div>
            <div class="card-value" style="color: #2563eb;">${totalReach.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Views</div>
            <div class="card-value">${totalViews.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Likes</div>
            <div class="card-value" style="color: #10b981;">${totalLikes.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Shares</div>
            <div class="card-value" style="color: #f59e0b;">${totalShares.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Avg Engagement</div>
            <div class="card-value" style="color: #059669;">${avgEngagement}%</div>
          </div>
        </div>

        <h3 style="font-size: 14px; margin-bottom: 8px; color: #1f2937;">Campaign & Video Performance Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Networks</th>
              <th class="right">Reach</th>
              <th class="right">Views</th>
              <th class="right">Likes</th>
              <th class="right">Comments</th>
              <th class="right">Shares</th>
              <th class="right">Eng. Rate</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Generated by Reelcast Social Studio • Multi-Channel Reel & Short Publisher</span>
          <span>Confidential Creator Report • ${reportDate}</span>
        </div>

        <script>
          // Automatically prompt print dialog after content renders
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}
