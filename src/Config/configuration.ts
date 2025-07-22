export default () => ({
  port: parseInt(process.env.PORT || '3000', 10), 
  database: {
    uri: process.env.MONGO_URI || 'mongodb+srv://alimboyevjayxun007:7HxTSKwKqqtrzUJu@cluster0.xzgrmdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretjwtkey',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey',
    expiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10), 
    user: process.env.MAIL_USER || 'your_email@gmail.com',
    pass: process.env.MAIL_PASS || 'your_gmail_app_password',
    from: process.env.MAIL_FROM || '"NestJS Auth" <noreply@example.com>',
  },
  otp: {
    expiresInMinutes: 15,
  },
});