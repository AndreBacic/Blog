namespace BlogAPI.Models
{
    public class CommentAuthorViewModel
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Name
        {
            get
            {
                return this.FirstName + " " + this.LastName;
            }
        }
    }
}
