const verificationEmail = (verificationToken, baseUrl) => {
  return `
    <html>
      <head>
        <style>
      body {
        font-family: Poppins, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
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
        color: #ffffff;
        margin-top: 20px;
      }
      .content h3 {
        font-size: 24px;
        color: #ffffff;
        margin-top: 20px;
      }
      .content p {
        font-size: 14px;
        color: #ffffff;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 12px;
        background-color: #dd0000;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .info p {
        text-align: center;
        font-size: 14px;
        color: #aaa;
        margin-top: 20px;
      }
      .footer {
        background-color: #25292e;
        font-size: 14px;
        color: #aaa;
      }
    </style>
  </head>
  <body>
    <table class="container" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td class="header">
          <img src="https://platzua.com/logo.png" alt="PlatzUA Logo" />
          <h3 style="color: #ffffff">platzua.com</h3>
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
            style="color: #ffffff"
            >Підтвердити реєстрацію</a
          >
        </td>
      </tr>
      <tr>
        <td class="info">
          <p>
            Не відповідайте на цей лист, так як він був надісланий автоматично.
            Якщо ви не реєструвалися на нашій платформі, просто проігноруйте
            його.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <h4>PlatzUA - Der Marktplatz für Ukrainer in Deutschland</h4>
          <p>
            Онлайн-платформа для українців в Німеччині. Купуйте та продавайте
            будь-які речі, товари, послуги та інше онлайн.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};

export default verificationEmail;
