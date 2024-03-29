﻿using BlogDataLibrary.Models;
using System;
using System.Collections.Generic;

namespace BlogDataLibrary.Tests.Controllers
{
    public static class ApiSampleData
    {
        public static List<ArticleModel> GetSampleArticles()
        {
            List<ArticleModel> output = new List<ArticleModel>();
            List<CommentModel> comments = GetSampleComments();
            output.Add(new ArticleModel
            {
                AuthorName = "Joe",
                Comments = comments,
                ContentText = "This is sample content",
                DatePosted = DateTime.UtcNow,
                Id = 2,
                Tags = null,
                Title = "Sample Article"
            });
            List<string> tags = new List<string>();
            tags.Add("peaceful");
            output.Add(new ArticleModel
            {
                AuthorName = "Joe",
                Comments = comments,
                ContentText = "ContentText 2B content",
                DatePosted = DateTime.UtcNow,
                Id = 1,
                Tags = tags,
                Title = "Sample Article 2"
            });

            return output;
        }
        public static List<CommentModel> GetSampleComments()
        {
            List<CommentModel> output = new List<CommentModel>();
            output.Add(new CommentModel
            {
                Id = 1,
                Author = GetSampleUser(),
                AuthorId = 1,
                ContentText = "Nice post",
                DatePosted = DateTime.UtcNow
            });
            output.Add(new CommentModel
            {
                Id = 2,
                Author = GetSampleUser(),
                AuthorId = 2,
                ContentText = "Cool post",
                DatePosted = DateTime.UtcNow
            });
            return output;
        }

        public static UserModel GetSampleUser()
        {
            return new UserModel
            {
                Id = 1,
                FirstName = "Joe",
                LastName = "Smith",
                Role = "Person",
                EmailAddress = "joe@smith.net",
                DoesReceiveNotifications = true,
                PasswordHash = "3000.asdfasdfasdfasdfDDDUIO==.ASDFasdfASDFasdfGHJKghjkGHJKghjkWERTwertert="
            };
        }
    }
}
