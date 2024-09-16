using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;
using LabPortal.Models.CreateDtos;
using Microsoft.Data.SqlClient;
using System.Data;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public LogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Logs/FilteredLogs/Lab
        [HttpGet("FilteredLogs/Lab")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogsLab([FromQuery] int labId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (_context.Logs == null)
            {
                return NotFound("Log context is not available.");
            }

            var filteredLogs = new List<FilteredLogDto>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetLabLogs] @LabId, @StartDate, @EndDate";
                    command.Parameters.Add(new SqlParameter("@LabId", labId));
                    command.Parameters.Add(new SqlParameter("@StartDate", startDate ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@EndDate", endDate ?? (object)DBNull.Value));

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var log = new FilteredLogDto
                            {
                                Id = reader.GetInt32(0),
                                StudentId = reader.GetInt32(1),
                                ItemId = reader.IsDBNull(2) ? (int?)null : reader.GetInt32(2),
                                ItemDescription = reader.IsDBNull(3) ? (String?)null : reader.GetString(3),
                                StudentName = reader.GetString(4) + " " + reader.GetString(5),
                                TimeIn = reader.GetDateTime(6),
                                TimeOut = reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7),
                                MonitorID = reader.IsDBNull(8) ? 99999999 : reader.GetInt32(8)
                            };
                            filteredLogs.Add(log);
                        }
                    }
                }
            }

            if (!filteredLogs.Any())
            {
                return NotFound("No logs found");
            }

            return Ok(filteredLogs);
        }

        // GET: api/Logs/FilteredLogs/Department
        [HttpGet("FilteredLogs/Department")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogs([FromQuery] int deptId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (_context.Logs == null)
            {
                return NotFound("Log context is not available.");
            }

            var filteredLogs = new List<FilteredLogDto>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetLogsByDept] @DeptId, @StartDate, @EndDate";
                    command.Parameters.Add(new SqlParameter("@DeptId", deptId));
                    command.Parameters.Add(new SqlParameter("@StartDate", startDate ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@EndDate", endDate ?? (object)DBNull.Value));

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var log = new FilteredLogDto
                            {
                                Id = reader.GetInt32(0),
                                StudentId = reader.GetInt32(1),
                                ItemId = reader.IsDBNull(2) ? (int?)null :  reader.GetInt32(2),
                                ItemDescription = reader.IsDBNull(3) ? (String?)null : reader.GetString(3),
                                StudentName = reader.GetString(4) + " " + reader.GetString(5),
                                TimeIn = reader.GetDateTime(6),
                                TimeOut = reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7),
                                MonitorID = reader.IsDBNull(8) ? 99999999 : reader.GetInt32(8)
                            };
                            filteredLogs.Add(log);
                        }
                    }
                }
            }

            if (!filteredLogs.Any())
            {
                return NotFound("No logs found");
            }

            return Ok(filteredLogs);
        }

        // GET: api/Logs/FilteredByDate
        [HttpGet("FilteredLogs")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogsFilteredByDate([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (_context.Logs == null)
            {
                return NotFound("Log context is not available.");
            }

            var filteredLogs = new List<FilteredLogDto>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetFilteredLogs] @StartDate, @EndDate";
                    command.Parameters.Add(new SqlParameter("@StartDate", startDate ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@EndDate", endDate ?? (object)DBNull.Value));

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var log = new FilteredLogDto
                            {
                                Id = reader.GetInt32(0),
                                StudentId = reader.GetInt32(1),
                                ItemId = reader.IsDBNull(2) ? (int?)null : reader.GetInt32(2),
                                ItemDescription = reader.IsDBNull(3) ? (String?)null : reader.GetString(3),
                                ItemPicture = reader.IsDBNull(4) ? null : reader.GetString(4),
                                StudentName = reader.GetString(5) + " " + reader.GetString(6),
                                TimeIn = reader.GetDateTime(7),
                                TimeOut = reader.IsDBNull(8) ? (DateTime?)null : reader.GetDateTime(8),
                                MonitorID = reader.IsDBNull(9) ? 99999999 : reader.GetInt32(9)
                            };
                            filteredLogs.Add(log);
                        }
                    }
                }
            }

            if (!filteredLogs.Any())
            {
                return NotFound("No logs found within the specified date range.");
            }

            return Ok(filteredLogs);
        }

        // PUT: api/Logs/5
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> PutLog(int id, LogCreateDto logDto)
        {
            var transactionTypeId = 1; // 1 = Update

            try
            {
                var commandText = @"
                    EXEC [dbo].[usp_UpdateLogTransaction] 
                    @StudentId = @StudentId, 
                    @ItemId = @ItemId,
                    @Timein = @Timein, 
                    @Timeout = @Timeout, 
                    @TransactionType = @TransactionType, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @FkLog = @FkLog,
                    @Scanned = @Scanned";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", logDto.StudentId),
                    new SqlParameter("@ItemId", logDto.ItemId ?? (object)DBNull.Value),
                    new SqlParameter("@Timein", logDto.Timein),
                    new SqlParameter("@Timeout", logDto.Timeout ?? (object)DBNull.Value),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", logDto.LabId),
                    new SqlParameter("@MonitorId", logDto.MonitorId),
                    new SqlParameter("@FkLog", id),
                    new SqlParameter("@Scanned", logDto.IsScanned)
                };

                await _context.Database.ExecuteSqlRawAsync(commandText, parameters);
                return NoContent();
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // POST: api/Logs
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CheckinDto>> PostLog(LogCreateDto logDto)
        {
            try
            {
                int summaryId;

                using (var connection = _context.Database.GetDbConnection())
                {
                    await connection.OpenAsync();

                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            DECLARE @SummaryID INT;
                            EXEC @SummaryID = [dbo].[usp_InsertLog] 
                                @StudentId = @StudentId, 
                                @LabId = @LabId, 
                                @MonitorId = @MonitorId, 
                                @Timein = @Timein,
                                @ItemID = @ItemID,
                                @Scanned = @Scanned;
                            SELECT @SummaryID;";

                        command.Parameters.Add(new SqlParameter("@StudentId", logDto.StudentId));
                        command.Parameters.Add(new SqlParameter("@LabId", logDto.LabId));
                        command.Parameters.Add(new SqlParameter("@MonitorId", logDto.MonitorId));
                        command.Parameters.Add(new SqlParameter("@Timein", logDto.Timein));
                        command.Parameters.Add(new SqlParameter("@ItemID", logDto.ItemId ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@Scanned", logDto.IsScanned));

                        summaryId = (int)await command.ExecuteScalarAsync();
                    }
                }

                var checkinDto = new CheckinDto
                {
                    SummaryId = summaryId,
                    StudentId = logDto.StudentId,
                    Timein = logDto.Timein,
                    LabId = logDto.LabId,
                    MonitorId = logDto.MonitorId,
                    ItemId = logDto.ItemId,
                    IsDeleted = false,
                };

                return CreatedAtAction(nameof(GetLogs), new { id = summaryId }, checkinDto);
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // PUT: api/Logs/TimeOut/5
        [HttpPut("TimeOut/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> TimeOutLog(int id, int monitor, bool isScanned)
        {
            try
            {
                var log = await _context.LogSummaries.FindAsync(id);
                if (log == null)
                {
                    return NotFound();
                }

                var transactionTypeId = 2; // 2 = Time Out

                var commandText = @"
                    EXEC [dbo].[usp_UpdateLogTransaction] 
                    @StudentId = @StudentId, 
                    @ItemId = @ItemId,
                    @Timein = @Timein, 
                    @Timeout = @Timeout, 
                    @TransactionType = @TransactionType, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @FkLog = @FkLog,
                    @Scanned = @Scanned";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", log.StudentId),
                    new SqlParameter("@ItemId", log.ItemId ?? (object)DBNull.Value),
                    new SqlParameter("@Timein", log.CheckInTime),
                    new SqlParameter("@Timeout", DateTime.UtcNow),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", log.LabId),
                    new SqlParameter("@MonitorId", monitor),
                    new SqlParameter("@FkLog", id),
                    new SqlParameter("@Scanned", isScanned)
                };

                await _context.Database.ExecuteSqlRawAsync(commandText, parameters);

                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // DELETE: api/Logs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteLog(int id, int monitor)
        {
            try
            {
                var log = await _context.LogSummaries.FindAsync(id);
                if (log == null)
                {
                    return NotFound();
                }

                var transactionTypeId = 3; // 3 = Delete

                // Handle possible null values for CheckInTime
                var timeIn = log.CheckInTime.HasValue ? log.CheckInTime.Value : (object)DBNull.Value;

                var commandText = @"
                    EXEC [dbo].[usp_UpdateLogTransaction] 
                    @StudentId = @StudentId, 
                    @ItemId = @ItemId,
                    @Timein = @Timein, 
                    @Timeout = @Timeout, 
                    @TransactionType = @TransactionType, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @FkLog = @FkLog,
                    @Scanned = @Scanned";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", log.StudentId),
                    new SqlParameter("@ItemId", log.ItemId ?? (object)DBNull.Value),
                    new SqlParameter("@Timein", timeIn),
                    new SqlParameter("@Timeout", DBNull.Value),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", log.LabId),
                    new SqlParameter("@MonitorId", monitor),
                    new SqlParameter("@FkLog", id),
                    new SqlParameter("@Scanned", false)
                };

                await _context.Database.ExecuteSqlRawAsync(commandText, parameters);

                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // Retrieves the transaction history for a given LogSummary ID
        [HttpGet("History/{summaryId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<LogHistoryDto>>> GetLogHistory(int summaryId)
        {
            if (_context.Logs == null)
            {
                return NotFound("Log context is not available.");
            }

            var logHistory = new List<LogHistoryDto>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetLogHistoryBySummaryID] @SummaryID";
                    command.Parameters.Add(new SqlParameter("@SummaryID", summaryId));

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var log = new LogHistoryDto
                            {
                                StudentId = reader.GetInt32(0),
                                ItemId = reader.IsDBNull(1) ? null : reader.GetInt32(1),
                                Timestamp = reader.GetDateTime(2),
                                TransactionType = reader.GetString(3),
                                LabId = reader.GetInt32(4),
                                MonitorId = reader.GetInt32(5),
                                isScanned = !reader.IsDBNull(6) && reader.GetBoolean(6),
                            };
                            logHistory.Add(log);
                        }
                    }
                }
            }

            if (!logHistory.Any())
            {
                return NotFound($"No log history found for Summary ID {summaryId}");
            }

            return Ok(logHistory);
        }

        // GET: api/Logs/{summaryId}
        [HttpGet("{summaryId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CheckinDto>> GetSummaryById(int summaryId)
        {
            var summary = await _context.LogSummaries
                .Where(s => s.SummaryId == summaryId)
                .Select(s => new CheckinDto
                {
                    SummaryId = s.SummaryId,
                    StudentId = s.StudentId,
                    Timein = s.CheckInTime,
                    Timeout = s.CheckOutTime,
                    LabId = s.LabId,
                    MonitorId = s.MonitorId,
                    ItemId = s.ItemId,
                    IsDeleted = s.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (summary == null)
            {
                return NotFound();
            }

            return Ok(summary);
        }

        // GET: api/Logs/
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CheckinDto>>> GetAllSummaries()
        {
            var summaries = await _context.LogSummaries
                .Select(s => new CheckinDto
                {
                    SummaryId = s.SummaryId,
                    StudentId = s.StudentId,
                    Timein = s.CheckInTime,
                    Timeout = s.CheckOutTime,
                    LabId = s.LabId,
                    MonitorId = s.MonitorId,
                    ItemId = s.ItemId,
                    IsDeleted = s.IsDeleted
                })
                .ToListAsync();

            return Ok(summaries);
        }

        // GET: api/Logs/Summary
        [HttpGet("Summary")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<LogSummaryDto>>> GetLogSummary(
            [FromQuery] string term,
            [FromQuery] DateTime? startTime,
            [FromQuery] DateTime? endTime,
            [FromQuery] bool? isItem,
            [FromQuery] int? deptID)
        {
            if (_context.Logs == null)
            {
                return BadRequest("Log context is not available.");
            }

            var logSummaries = new List<LogSummaryDto>();

            try
            {
                using (var connection = _context.Database.GetDbConnection())
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "EXEC [dbo].[usp_GetLogSummaryCounts] @Term, @StartTime, @EndTime, @IsItem, @DeptID";
                        command.Parameters.Add(new SqlParameter("@Term", term));
                        command.Parameters.Add(new SqlParameter("@StartTime", startTime ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@EndTime", endTime ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@IsItem", isItem.HasValue ? (object)isItem.Value : DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@DeptID", deptID ?? (object)DBNull.Value));

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var logSummary = new LogSummaryDto
                                {
                                    LabID = reader.GetInt32(0),  // LabID should be int
                                    LabName = reader.GetString(1), // LabName should be string

                                    // If Term is an integer or other type, use GetInt32 or appropriate method
                                    Term = reader.IsDBNull(2) ? null : reader[2].ToString(),  // Safely convert any type to string

                                    Count = reader.GetInt32(3) // Count should be int
                                };
                                logSummaries.Add(logSummary);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok(new List<LogSummaryDto>()); // Return an empty list instead of throwing an error
            }

            return Ok(logSummaries);
        }







        // GET: api/Logs/Lab/{labId}
        // Retrieves log summaries filtered by LabId
        [HttpGet("Lab/{labId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<CheckinDto>>> GetSummariesByLabId(int labId)
        {
            var summaries = await _context.LogSummaries
                .Where(s => s.LabId == labId)
                .Select(s => new CheckinDto
                {
                    SummaryId = s.SummaryId,
                    StudentId = s.StudentId,
                    Timein = s.CheckInTime,
                    Timeout = s.CheckOutTime,
                    LabId = s.LabId,
                    MonitorId = s.MonitorId,
                    IsDeleted = s.IsDeleted
                })
                .ToListAsync();

            return Ok(summaries);
        }
    }
}
