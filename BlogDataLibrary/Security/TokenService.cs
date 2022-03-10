using BlogDataLibrary.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogDataLibrary.Security
{
    public static class TokenService
    {
        public static string GenerateJwtToken(List<Claim> userClaims, string signingKey)
        {
            if (!userClaims.Any(x => x.Type == JwtRegisteredClaimNames.Nbf))
            {
                userClaims.Add(new Claim(JwtRegisteredClaimNames.Nbf,
                                        new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString()));
            }
            if (!userClaims.Any(x => x.Type == JwtRegisteredClaimNames.Exp))
            {
                userClaims.Add(new Claim(JwtRegisteredClaimNames.Exp,
                                    new DateTimeOffset(DateTime.UtcNow.AddMinutes(15)).ToUnixTimeSeconds().ToString()));
            }

            JwtSecurityToken token = new JwtSecurityToken(
                        new JwtHeader(
                            new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                                                    SecurityAlgorithms.HmacSha256)),
                        new JwtPayload(userClaims));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static RefreshTokenModel GenerateRefreshToken(int userId, string ipAddress)
        {
            using (RNGCryptoServiceProvider rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                byte[] randomBytes = new byte[64];
                rngCryptoServiceProvider.GetBytes(randomBytes);
                return new RefreshTokenModel
                {
                    Token = Convert.ToBase64String(randomBytes),
                    Created = DateTime.UtcNow,
                    CreatedByIp = ipAddress,
                    Expires = DateTime.UtcNow.AddDays(7),
                    OwnerId = userId
                };
            }
        }
    }
}
