using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmaStamaFeedbackHub.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Feedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Feedbacks");
        }
    }
}
