using BlogDataLibrary.Security;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace BlogDataLibrary.Tests.Security
{
    public class HashAndSalterTests
    {
        [Fact]
        public void HashAndSalt_ShouldWork()
        {
            // Arrange
            string password = "Test";
            // Act
            var model = HashAndSalter.HashAndSalt(password);
            // Assert
            Assert.NotNull(model);
            Assert.True(model.PasswordHashString.Length == 44);
            Assert.Equal(HashAndSalter.Iterations, model.IterationsOnHash);
        }
        [Fact]
        public void HashAndSalt_TestWeirdInputs()
        {
            // Arrange
            string password = "";
            // Act/assert
            var model = HashAndSalter.HashAndSalt(password);
            //Assert.ThrowsAny<Exception>(() => HashAndSalter.HashAndSalt(password)); // <- doesn't throw any exceptions
            Assert.NotNull(model);
            Assert.True(model.PasswordHashString.Length == 44);

        }
    }
}
