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
        private readonly string _senderEmail;
        private readonly string _senderDisplayName;

        public EmailService(IConfiguration configuration)
        {
            _senderEmail = configuration.GetValue<string>("senderEmail");
            _senderDisplayName = configuration.GetValue<string>("senderDisplayName");
        }
        public void SendEmail(UserModel to, string subject, string plainTextBody)
        {
            SendEmail(new List<UserModel> { to }, new List<UserModel>(), subject, plainTextBody, true);
        }

        public void SendEmail(List<UserModel> to, List<UserModel> bcc, string subject, string body, bool isPlainTextBody)
        {
            MimeMessage mailMessage = new MimeMessage();
            mailMessage.From.Add(new MailboxAddress(_senderDisplayName, _senderEmail));
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
                client.Connect("smtp.gmail.com", 587, true);
                client.Authenticate("user", "password");
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
    }
}
