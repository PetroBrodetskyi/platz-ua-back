const verificationEmail = (verificationToken, baseUrl) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Poppins, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #25292ef5;
          }
          .container {
            display: flex;
            flex-direction: column;
            gap: 28px;
            width: 100%;
            margin: 0 auto;
            padding: 20px;
            background-color: #25292ef5;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-align: center;
          }

          .header h3 {
            color: #fff;
          }

          .logo {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(177, 177, 177, 0.786);
          }
          .content {
            text-align: center;
            color: #fff;
          }
          .content h3 {
            font-size: 24px;
            color: #fff;
          }
          .content p {
            font-size: 14px;
            color: #fff;
          }
          .btn {
            display: inline-block;
            margin-top: 10px;
            padding: 12px;
            background-color: #dd0000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #aaa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img
              class="logo"
              src="https://platzua.com/logo.png"
              alt="PlatzUA Logo"
            />
            <h3>platzua.com</h3>
          </div>
          <div class="content">
            <h3>Вітаємо на платформі PlatzUA!</h3>
            <p>
              Щоб підтвердити Ваш Email та завершити реєстрацію, натисніть на кнопку
              нижче:
            </p>
            <a href="${baseUrl}/api/users/verify/${verificationToken}" class="btn"
              >Підтвердити реєстрацію</a
            >
          </div>
          <div class="footer">
            <p>
              Цей лист був надісланий автоматично. Якщо ви не реєструвалися на нашій
              платформі, просто проігноруйте його.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default verificationEmail;
