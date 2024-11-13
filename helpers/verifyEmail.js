export const verificationEmail = (verificationToken, baseUrl) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header img {
            width: 150px;
          }
          .content {
            text-align: center;
          }
          .content h2 {
            font-size: 24px;
            color: #333;
          }
          .content p {
            font-size: 16px;
            color: #666;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 25px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #aaa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://platzua.com/logo.png" alt="Platzua Logo"/>
          </div>
          <div class="content">
            <h2>Вітаємо на платформі Platzua!</h2>
            <p>Щоб завершити реєстрацію, натисніть на кнопку нижче:</p>
            <a href="${baseUrl}/api/users/verify/${verificationToken}" class="btn">Підтвердити реєстрацію</a>
          </div>
          <div class="footer">
            <p>Цей лист був надісланий автоматично. Якщо ви не реєструвалися на нашій платформі, просто проігноруйте його.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
