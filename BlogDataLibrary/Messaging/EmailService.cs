using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using MailKit.Net.Smtp;
using MimeKit;
using BlogDataLibrary.Models;

namespace BlogDataLibrary.Messaging
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration configuration)
        {
            _config = configuration;
        }
        public void SendEmail(UserModel to, string subject, string plainTextBody)
        {
            SendEmail(new List<UserModel> { to }, new List<UserModel>(), subject, plainTextBody, true);
        }

        public void SendEmail(List<UserModel> to, List<UserModel> bcc, string subject, string body, bool isPlainTextBody)
        {
            MimeMessage mailMessage = new MimeMessage();
            mailMessage.From.Add(
                new MailboxAddress(GetAppSetting("senderDisplayName"), 
                                   GetAppSetting("senderEmail")));

            foreach (var user in to)
            {
                mailMessage.To.Add(new MailboxAddress(user.Name, user.EmailAddress));
            }
            foreach (var user in bcc)
            {
                mailMessage.Bcc.Add(new MailboxAddress(user.Name, user.EmailAddress));
            }
            mailMessage.Subject = subject;
            mailMessage.Body = new TextPart(isPlainTextBody ? "plain" : "html")
            {
                Text = body
            };

            using (SmtpClient client = new SmtpClient())
            {
                client.Connect(GetAppSetting("Host"), int.Parse(GetAppSetting("port")), bool.Parse(GetAppSetting("UseSsl")));
                //client.Authenticate(GetAppSetting("Username"), GetAppSetting("Password"));
                client.Send(mailMessage);
                client.Disconnect(true);
            }
        }
        public bool IsValidEmailAddress(string emailAddress)
        {
            try
            {
                System.Net.Mail.MailAddress m = new System.Net.Mail.MailAddress(emailAddress);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        private string GetAppSetting(string appSetting)
        {
            return _config.GetValue<string>($"Smtp:{appSetting}");
        }
    }
}
