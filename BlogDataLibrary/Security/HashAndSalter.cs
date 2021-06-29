using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace BlogDataLibrary.Security
{
    /// <summary>
    /// The iterations, salt, and resulting hash must be stored in the database separated by a period in the form "iterations.salt.passwordHash"
    /// For example: "10000.Dvsge98yPQCkqSyxgkKZZA==.DMxNfQFQxDgwX3tSIgNijOr7+uFkZqVlmdZJHBMejdM="
    /// </summary>
    public static class HashAndSalter
    {
        /// <summary>
        /// Takes a password and returns the password hashed and with the salt and iteration count in a PasswordHashModel.
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
        public static PasswordHashModel HashAndSalt(string password)
        {
            // generate a 128-bit salt using a secure PRNG
            byte[] salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // derive a 256-bit subkey (use HMACSHA512 with a certain number of iterations)
            // note: I swithced to HMACSHA512 from the docs code because a bigger number seems better
            byte[] hashed = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: Iterations,
                numBytesRequested: 32);

            PasswordHashModel output = new PasswordHashModel
            {
                IterationsOnHash = Iterations,
                Salt = salt,
                PasswordHash = hashed
            };
            return output;
        }

        /// <summary>
        /// Hashes password using salt and the specified number of iterations and then compares it to hash.
        /// 
        /// Returns not only if the hashed password equals the hash, but also if the specified iterations needs to be upgraded to HashAndSalter.Iterations
        /// </summary>
        /// <param name="password"></param>
        /// <param name="hash"></param>
        /// <param name="salt"></param>
        /// <param name="iterations"></param>
        /// <returns></returns>
        /// 
        public static (bool, bool iterationsNeedsUpgrade) PasswordEqualsHash(string password, byte[] hash, byte[] salt, int iterations = -1)
        {
            if (iterations <= 0)
            {
                iterations = Iterations;
            }

            byte[] hashedPassword = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: iterations,
                numBytesRequested: 32);

            bool passwordEqualsHash = (hashedPassword.SequenceEqual(hash));
            bool needsUpgrade = (iterations != Iterations);
            return (passwordEqualsHash, iterationsNeedsUpgrade: needsUpgrade);
        }
        public static (bool, bool iterationsNeedsUpgrade) PasswordEqualsHash(string password, string hash, string salt, int iterations = -1)
        {
            return PasswordEqualsHash(password,
                Convert.FromBase64String(hash),
                Convert.FromBase64String(salt),
                iterations);
        }
        public static (bool, bool iterationsNeedsUpgrade) PasswordEqualsHash(string password, PasswordHashModel passwordHashModel)
        {
            return PasswordEqualsHash(password,
                passwordHashModel.PasswordHash,
                passwordHashModel.Salt,
                passwordHashModel.IterationsOnHash);
        }

        public static int Iterations { get; set; } = 10000;
    }
}
