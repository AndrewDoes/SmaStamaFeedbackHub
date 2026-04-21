using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmaStamaFeedbackHub.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackAuditing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS \"FeedbackLogs\" CASCADE;");
            migrationBuilder.CreateTable(
                name: "FeedbackLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FeedbackId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: false),
                    NewValue = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedbackLogs_Feedbacks_FeedbackId",
                        column: x => x.FeedbackId,
                        principalTable: "Feedbacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeedbackLogs_Users_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackLogs_AdminId",
                table: "FeedbackLogs",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackLogs_FeedbackId",
                table: "FeedbackLogs",
                column: "FeedbackId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeedbackLogs");
        }
    }
}
