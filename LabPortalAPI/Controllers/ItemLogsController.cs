//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using LabPortal.Models;
//using System.Text;
//using System.Security.Cryptography;
//using LabPortal.Models.Dto;

//namespace LabPortal.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class ItemLogsController : ControllerBase
//    {
//        private readonly TESTContext _context;

//        public ItemLogsController(TESTContext context)
//        {
//            _context = context;
//        }

//        // GET: api/ItemLogs
//        [HttpGet]
//        [ProducesResponseType(StatusCodes.Status200OK)]
//        [ProducesResponseType(StatusCodes.Status400BadRequest)]
//        [ProducesResponseType(StatusCodes.Status404NotFound)]
//        public async Task<ActionResult<IEnumerable<ItemLogDto>>> GetItemLogs()
//        {
//            if (_context.ItemLogs == null)
//            {
//                return NotFound();
//            }

//            var itemLogs = await _context.ItemLogs.ToListAsync();
//            var itemLogDtos = itemLogs.Select(ItemLog => new ItemLogDto
//            {
//                LogId = ItemLog.LogId,
//                ItemId = ItemLog.ItemId,
//                Timestamp = ItemLog.Timestamp,
//                TransactionType = ItemLog.TransactionType,
//                StudentId = ItemLog.StudentId,
//                MonitorId = ItemLog.MonitorId

//            }).ToList();

//            return Ok(itemLogDtos);
//        }

//        // GET: api/ItemLogs/5
//        [HttpGet("{id}")]
//        [ProducesResponseType(StatusCodes.Status200OK)]
//        [ProducesResponseType(StatusCodes.Status400BadRequest)]
//        [ProducesResponseType(StatusCodes.Status404NotFound)]
//        public async Task<ActionResult<ItemLogDto>> GetItemLog(int id)
//        {
//            if (_context.ItemLogs == null)
//            {
//                return NotFound();
//            }
//            var itemLog = await _context.ItemLogs.FindAsync(id);

//            if (itemLog == null)
//            {
//                return NotFound();
//            }

//            var itemLogDto = new ItemLogDto
//            {
//                LogId = itemLog.LogId,
//                ItemId = itemLog.ItemId,
//                Timestamp = itemLog.Timestamp,
//                TransactionType = itemLog.TransactionType,
//                StudentId = itemLog.StudentId,
//                MonitorId = itemLog.MonitorId
//            };

//            return Ok(itemLogDto);
//        }

//        // PUT: api/ItemLogs/5
//        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
//        [HttpPut("{id}")]
//        [ProducesResponseType(StatusCodes.Status200OK)]
//        [ProducesResponseType(StatusCodes.Status400BadRequest)]
//        public async Task<IActionResult> PutItemLog(int id, ItemLogDto itemLogDto)
//        {
//            if (id != itemLogDto.LogId)
//            {
//                return BadRequest();
//            }
//            var itemLog = await _context.ItemLogs.FindAsync(id);
//            if (itemLog == null)
//            {
//                return NotFound();
//            }

//            itemLog.ItemId = itemLogDto.ItemId;
//            itemLog.Timestamp = itemLogDto.Timestamp;
//            itemLog.TransactionType = itemLogDto.TransactionType;
//            itemLog.StudentId = itemLogDto.StudentId;
//            itemLog.MonitorId = itemLogDto.MonitorId;

//            _context.Entry(itemLog).State = EntityState.Modified;

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateConcurrencyException)
//            {
//                if (!ItemLogExists(id))
//                {
//                    return NotFound();
//                }
//                else
//                {
//                    throw;
//                }
//            }

//            return NoContent();
//        }

//        // POST: api/ItemLogs
//        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
//        [HttpPost]
//        [ProducesResponseType(StatusCodes.Status200OK)]
//        [ProducesResponseType(StatusCodes.Status400BadRequest)]
//        public async Task<ActionResult<ItemLogDto>> PostItemLog(ItemLogDto itemLogDto)
//        {
//            if (_context.ItemLogs == null)
//            {
//                return Problem("Entity set 'TESTContext.ItemLogs'  is null.");
//            }

//            var itemLog = new ItemLog
//            {
//                ItemId = itemLogDto.ItemId,
//                Timestamp = itemLogDto.Timestamp,
//                TransactionType = itemLogDto.TransactionType,
//                StudentId = itemLogDto.StudentId,
//                MonitorId = itemLogDto.MonitorId
//            };

//            _context.ItemLogs.Add(itemLog);
//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateException ex)
//            {
//                // Simplified the error as to not show more info than needed
//                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the item log.");
//            }

//            return Ok();
//        }

//        // DELETE: api/ItemLogs/5
//        [HttpDelete("{id}")]
//        [ProducesResponseType(StatusCodes.Status200OK)]
//        [ProducesResponseType(StatusCodes.Status400BadRequest)]
//        public async Task<IActionResult> DeleteItemLog(int id)
//        {
//            if (_context.ItemLogs == null)
//            {
//                return NotFound();
//            }
//            var itemLog = await _context.ItemLogs.FindAsync(id);
//            if (itemLog == null)
//            {
//                return NotFound();
//            }

//            _context.ItemLogs.Remove(itemLog);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        private bool ItemLogExists(int id)
//        {
//            return (_context.ItemLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
//        }
//    }
//}