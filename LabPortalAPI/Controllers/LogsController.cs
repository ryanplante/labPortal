using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;
using LabPortal.Models.CreateDtos;
using Microsoft.Data.SqlClient;
using System.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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

        // GET: api/Logs/FilteredLogs
        // Retrieves all logs from the database by lab, optional start date and end dates
        [HttpGet("FilteredLogs/Lab")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogs([FromQuery]int labId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
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
                                StudentName = reader.GetString(2) + " " + reader.GetString(3),
                                TimeIn = reader.GetDateTime(4),
                                TimeOut = reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
                                MonitorID = reader.IsDBNull(6) ? 99999999 : reader.GetInt32(6)
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
        // Retrieves logs filtered by a specified date range
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
                                StudentName = reader.GetString(2) + " " + reader.GetString(3),
                                TimeIn = reader.GetDateTime(4),
                                TimeOut = reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
                                MonitorID = reader.IsDBNull(6) ? 99999999 : reader.GetInt32(6)
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
        // Updates a log by creating a new transaction and updating the old one
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
                    @Timein = @Timein, 
                    @Timeout = @Timeout, 
                    @TransactionType = @TransactionType, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @FkLog = @FkLog";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", logDto.StudentId),
                    new SqlParameter("@Timein", logDto.Timein),
                    new SqlParameter("@Timeout", logDto.Timein),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", logDto.LabId),
                    new SqlParameter("@MonitorId", logDto.MonitorId),
                    new SqlParameter("@FkLog", id)
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
        // Creates a new log entry (Check In)
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
                        @Timein = @Timein;
                    SELECT @SummaryID;";

                        command.Parameters.Add(new SqlParameter("@StudentId", logDto.StudentId));
                        command.Parameters.Add(new SqlParameter("@Timein", logDto.Timein));
                        command.Parameters.Add(new SqlParameter("@LabId", logDto.LabId));
                        command.Parameters.Add(new SqlParameter("@MonitorId", logDto.MonitorId));

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
                    IsDeleted = false
                };

                return CreatedAtAction(nameof(GetLogs), new { id = summaryId }, checkinDto);
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }



        // PUT: api/Logs/TimeOut/5
        // Creates a timeout transaction for a log
        [HttpPut("TimeOut/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> TimeOutLog(int id, int monitor)
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
                    @Timein = @Timein, 
                    @Timeout = @Timeout, 
                    @TransactionType = @TransactionType, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @FkLog = @FkLog";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", log.StudentId),
                    new SqlParameter("@Timein", log.CheckInTime),
                    new SqlParameter("@Timeout", log.CheckInTime),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", log.LabId),
                    new SqlParameter("@MonitorId", monitor),
                    new SqlParameter("@FkLog", id)
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
        // Creates a delete transaction for a log
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
            @Timein = @Timein, 
            @Timeout = @Timeout, 
            @TransactionType = @TransactionType, 
            @LabId = @LabId, 
            @MonitorId = @MonitorId, 
            @FkLog = @FkLog";

                var parameters = new[]
                {
            new SqlParameter("@StudentId", log.StudentId),
            new SqlParameter("@Timein", timeIn),
            new SqlParameter("@Timeout", DBNull.Value),
            new SqlParameter("@TransactionType", transactionTypeId),
            new SqlParameter("@LabId", log.LabId),
            new SqlParameter("@MonitorId", monitor),
            new SqlParameter("@FkLog", id)
        };

                await _context.Database.ExecuteSqlRawAsync(commandText, parameters);

                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }


        // Retrieves the log history for a given LogSummary ID
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
                                Timestamp = reader.GetDateTime(1),
                                TransactionType = reader.GetString(2),
                                LabId = reader.GetInt32(3),
                                MonitorId = reader.GetInt32(4)
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
        // Retrieves a log summary by SummaryId
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
        // Retrieves all log entries
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
                    IsDeleted = s.IsDeleted
                })
                .ToListAsync();

            return Ok(summaries);
        }

        //// GET: api/Logs/Lab/{labId}
        //// Retrieves log summaries filtered by LabId
        //[HttpGet("Lab/{labId}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //public async Task<ActionResult<IEnumerable<CheckinDto>>> GetSummariesByLabId(int labId)
        //{
        //    var summaries = await _context.LogSummaries
        //        .Where(s => s.LabId == labId)
        //        .Select(s => new CheckinDto
        //        {
        //            SummaryId = s.SummaryId,
        //            StudentId = s.StudentId,
        //            Timein = s.CheckInTime,
        //            Timeout = s.CheckOutTime,
        //            LabId = s.LabId,
        //            MonitorId = s.MonitorId,
        //            IsDeleted = s.IsDeleted
        //        })
        //        .ToListAsync();

        //    if (!summaries.Any())
        //    {
        //        return NotFound();
        //    }

        //    return Ok(summaries);
        //}
    }
}
