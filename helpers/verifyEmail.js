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
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #25292ef5;
          }
          .header,
          .content,
          .footer {
            text-align: center;
          }
          .header img {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(177, 177, 177, 0.786);
          }
          .header h3 {
            color: #fff;
            margin-top: 20px;
          }
          .content h3 {
            font-size: 24px;
            color: #fff;
            margin-top: 20px;
          }
          .content p {
            font-size: 14px;
            color: #fff;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px;
            background-color: #dd0000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
          }
          .footer p {
            font-size: 14px;
            color: #aaa;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <table class="container" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td class="header">
              <img src="https://platzua.com/logo.png" alt="PlatzUA Logo" />
              <h3>platzua.com</h3>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h3>Вітаємо на платформі PlatzUA!</h3>
              <p>
                Щоб підтвердити Ваш Email та завершити реєстрацію, натисніть на
                кнопку нижче:
              </p>
              <a
                href="${baseUrl}/api/users/verify/${verificationToken}"
                class="btn"
                target="_blank"
                >Підтвердити реєстрацію</a
              >
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>
                Цей лист був надісланий автоматично. Якщо ви не реєструвалися на
                нашій платформі, просто проігноруйте його.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default verificationEmail;
