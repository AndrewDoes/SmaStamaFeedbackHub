using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmaStamaFeedbackHub.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Feedbacks");
        }
    }
}
