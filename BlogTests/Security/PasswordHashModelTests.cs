using BlogDataLibrary.Security;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace BlogDataLibrary.Tests.Security
{
    public class PasswordHashModelTests
    {
        [Fact]
        public void ToDbString_ArrangesProperly()
        {
            //Arrange
            string expected = "5000.aaaabbbbcYccdddd.ddddccccaaaabbbb";

            //Act
            var model = new PasswordHashModel
            {
                IterationsOnHash = 5000,
                SaltString = "aaaabbbbcYccdddd",
                PasswordHashString = "ddddccccaaaabbbb"
            };
            string actual = model.ToDbString();

            //Assert
            Assert.Equal(expected, actual);
        }
        [Theory]
        [InlineData("3000.ASDasdUIOpqtYYYY.ddddccccaaaabbbb", 3000, "ASDasdUIOpqtYYYY", "ddddccccaaaabbbb")]
        public void FromDbString_RunsProperly(string dbString, 
            int iterationsExpected, string saltExpected, string hashExpected)
        {
            var model = new PasswordHashModel();
            model.FromDbString(dbString);

            Assert.Equal(iterationsExpected, model.IterationsOnHash);
            Assert.Equal(saltExpected, model.SaltString);
            Assert.Equal(hashExpected, model.PasswordHashString);
        }
    }
}
