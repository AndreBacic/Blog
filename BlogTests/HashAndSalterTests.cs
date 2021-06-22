using BlogDataLibrary.Security;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace BlogDataLibrary.Tests
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
        public void HashAndSalt_ShouldFail()
        {
            // Arrange
            string password = "";
            // Act/assert
            Assert.ThrowsAny<Exception>(() => HashAndSalter.HashAndSalt(password));
        }
    }
}
