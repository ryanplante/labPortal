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

        // GET: api/Logs
        // Retrieves all logs from the database
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogs()
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
                    command.CommandText = "EXEC [dbo].[usp_GetFilteredLogs] NULL, NULL";
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
        [HttpGet("FilteredByDate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<FilteredLogDto>>> GetLogsFilteredByDate([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (_context.Logs == null)
            {
                return NotFound("Log context is not available.");
            }

            if (startDate == null && endDate == null)
            {
                return BadRequest("Please provide at least a start date or an end date.");
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
        public async Task<ActionResult<LogDto>> PostLog(LogCreateDto logDto)
        {
            try
            {
                var commandText = @"
                    EXEC [dbo].[usp_InsertLog] 
                    @StudentId = @StudentId, 
                    @LabId = @LabId, 
                    @MonitorId = @MonitorId, 
                    @Timein = @Timein";

                var parameters = new[]
                {
                    new SqlParameter("@StudentId", logDto.StudentId),
                    new SqlParameter("@Timein", logDto.Timein),
                    new SqlParameter("@LabId", logDto.LabId),
                    new SqlParameter("@MonitorId", logDto.MonitorId),
                };

                await _context.Database.ExecuteSqlRawAsync(commandText, parameters);

                return CreatedAtAction(nameof(GetLogs), new { id = logDto.StudentId }, logDto);
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
        public async Task<IActionResult> TimeOutLog(int id, LogCreateDto logDto)
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
                    new SqlParameter("@Timeout", DateTime.UtcNow),
                    new SqlParameter("@TransactionType", transactionTypeId),
                    new SqlParameter("@LabId", log.LabId),
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

        // DELETE: api/Logs/5
        // Creates a delete transaction for a log
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteLog(int id, LogCreateDto logDto)
        {
            try
            {
                var log = await _context.LogSummaries.FindAsync(id);
                if (log == null)
                {
                    return NotFound();
                }

                var transactionTypeId = 3; // 3 = Delete

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

                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // Checks if a log exists by its ID
        private bool LogExists(int id)
        {
            return (_context.Logs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
