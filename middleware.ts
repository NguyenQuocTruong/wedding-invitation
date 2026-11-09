// Danh sách quốc gia được phép truy cập (ISO 3166-1 alpha-2)
const ALLOWED_COUNTRIES = ['VN', 'DE', 'CZ', 'JP', 'KR']

export default function middleware(request: Request) {
  const url = new URL(request.url)

  // 1. Bỏ qua các file tĩnh và tài nguyên hệ thống
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/assets') ||
    url.pathname.match(
      /\.(ico|png|jpg|jpeg|svg|css|js|woff2?|ttf|webp|gif|mp3)$/,
    )
  ) {
    return
  }

  // 2. Lấy thông tin vị trí địa lý do Vercel inject qua headers
  const country = request.headers.get('x-vercel-ip-country')
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown City'
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'Unknown IP'

  // 3. Nếu quốc gia KHÔNG nằm trong danh sách cho phép
  if (!country || !ALLOWED_COUNTRIES.includes(country)) {
    // Ghi log lên Runtime Logs của Vercel
    console.warn(
      `[BLOCKED] Quốc gia: ${country || 'Không xác định'} (${city}) | IP: ${ip} | Path: ${url.pathname}`,
    )

    return new Response(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>403 - Giới hạn khu vực truy cập</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f7f9fa;
              color: #333;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.08);
              text-align: center;
              max-width: 480px;
              margin: 20px;
            }
            h1 { color: #e53e3e; margin-bottom: 12px; font-size: 24px; }
            p { color: #555; line-height: 1.6; }
            .badge {
              display: inline-block;
              padding: 6px 12px;
              background: #edf2f7;
              border-radius: 6px;
              font-size: 13px;
              color: #4a5568;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>403 - Giới hạn khu vực truy cập</h1>
            <p>Trang web này hiện chỉ mở phục vụ người dùng tại <b>Việt Nam, Đức, Cộng hòa Séc, Nhật Bản và Hàn Quốc</b>.</p>
            <div class="badge">Vị trí nhận diện: ${country || 'Không xác định'} (${city})</div>
          </div>
        </body>
      </html>`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      },
    )
  }

  // Cho phép truy cập bình thường
  return
}
