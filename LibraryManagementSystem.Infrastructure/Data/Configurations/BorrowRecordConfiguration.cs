using LibraryManagementSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagementSystem.Infrastructure.Data.Configurations;

public class BorrowRecordConfiguration : IEntityTypeConfiguration<BorrowRecord>
{
    public void Configure(EntityTypeBuilder<BorrowRecord> builder)
    {
        builder.HasOne(br => br.Book)
            .WithMany(b => b.BorrowRecords)
            .HasForeignKey(br => br.BookId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(br => br.User)
            .WithMany(u => u.BorrowRecords)
            .HasForeignKey(br => br.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
