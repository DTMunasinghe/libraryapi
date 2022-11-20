using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace Aka.Library.Data.Model
{
    public class Book
    {
        [DataMember]
        public int BookId { get; set; }

        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public string Isbn { get; set; }

        [DataMember]
        public DateTime? DateOfPublication { get; set; }

        [DataMember]
        public bool IsAvailable { get; set; }
    }
}
