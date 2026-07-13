import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const baseUrl = process.env.API_URL || "http://localhost:4000";
  const link = `${baseUrl}/api/auth/verify/${token}`;

  const html = `
  <div style="background:#0f0f0f;padding:40px 0;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#181818;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
      <div style="background:linear-gradient(135deg,#e50914,#831010);padding:28px;text-align:center;">
        <span style="font-size:26px;font-weight:700;color:#fff;letter-spacing:1px;">🎬 FrameBox</span>
      </div>
      <div style="padding:32px;color:#e6e6e6;">
        <h1 style="font-size:20px;margin:0 0 12px;color:#fff;">Confirmá tu cuenta</h1>
        <p style="font-size:14px;line-height:1.6;color:#b3b3b3;">
          Gracias por registrarte en FrameBox, tu biblioteca personal de películas.
          Para empezar a usar tu cuenta, confirmá tu email haciendo click en el botón:
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${link}" style="background:#e50914;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;display:inline-block;">
            Verificar cuenta
          </a>
        </div>
        <p style="font-size:12px;color:#777;line-height:1.5;">
          Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>
          <a href="${link}" style="color:#e50914;">${link}</a>
        </p>
      </div>
      <div style="padding:16px;text-align:center;border-top:1px solid #2a2a2a;">
        <span style="font-size:11px;color:#555;">© ${new Date().getFullYear()} FrameBox — No respondas este email</span>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"FrameBox" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verificá tu cuenta - FrameBox",
    html,
  });
};

export default { sendVerificationEmail };
