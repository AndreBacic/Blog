﻿using System;

namespace BlogDataLibrary.Security
{
    public class PasswordHashModel
    {
        /// <summary>
        /// Returns this in the form it should be used to fit in the database.
        /// Database form is "iterations.salt.passwordHash"
        /// </summary>
        /// <returns></returns>
        public string ToDbString()
        {
            return $"{IterationsOnHash}.{SaltString}.{PasswordHashString}";
        }

        /// <summary>
        /// Takes a db password hash that must be in the form "iterations.salt.passwordHash" and fills out this's fields
        /// </summary>
        /// <param name="dbPasswordHash"></param>
        public void FromDbString(string dbPasswordHash)
        {
            string[] splitDbString = dbPasswordHash.Split('.');
            if (splitDbString.Length != 3)
            {
                throw new FormatException("dbPasswordHash must be in the form 'iterations.salt.passwordHash'");
            }

            int iterations;
            bool isIntInterations = int.TryParse(splitDbString[0], out iterations);
            if (isIntInterations == false)
            {
                throw new FormatException("iteration count from dbString must be an integer");
            }
            IterationsOnHash = iterations;
            SaltString = splitDbString[1];
            PasswordHashString = splitDbString[2];
        }
        public byte[] PasswordHash { get; set; }
        public byte[] Salt { get; set; }
        public string PasswordHashString
        {
            get => Convert.ToBase64String(PasswordHash);
            set => PasswordHash = Convert.FromBase64String(value);
        }
        public string SaltString
        {
            get => Convert.ToBase64String(Salt);
            set => Salt = Convert.FromBase64String(value);
        }
        public int IterationsOnHash { get; set; }
    }
}
