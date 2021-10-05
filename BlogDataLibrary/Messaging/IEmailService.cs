using BlogDataLibrary.Models;
using System.Collections.Generic;

namespace BlogDataLibrary.Messaging
{
    public interface IEmailService
    {
        bool IsValidEmailAddress(string emailAddress);
        void SendEmail(List<UserModel> to, List<UserModel> bcc, string subject, string body, bool isPlainTextBody);
        void SendEmail(UserModel to, string subject, string plainTextBody);
    }
}