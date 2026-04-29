using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmaStamaFeedbackHub.Entities.Migrations
{
    /// <inheritdoc />
    public partial class RemoveForbiddenWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ForbiddenWords");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ForbiddenWords",
                columns: table => new
                {
                    Word = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForbiddenWords", x => x.Word);
                });
        }
    }
}
