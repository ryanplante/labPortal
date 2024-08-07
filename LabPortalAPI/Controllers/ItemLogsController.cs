using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemLogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public ItemLogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/ItemLogs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ItemLog>>> GetItemLogs()
        {
          if (_context.ItemLogs == null)
          {
              return NotFound();
          }
            return await _context.ItemLogs.ToListAsync();
        }

        // GET: api/ItemLogs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ItemLog>> GetItemLog(int id)
        {
          if (_context.ItemLogs == null)
          {
              return NotFound();
          }
            var itemLog = await _context.ItemLogs.FindAsync(id);

            if (itemLog == null)
            {
                return NotFound();
            }

            return itemLog;
        }

        // PUT: api/ItemLogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutItemLog(int id, ItemLog itemLog)
        {
            if (id != itemLog.LogId)
            {
                return BadRequest();
            }

            _context.Entry(itemLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemLogExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ItemLogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ItemLog>> PostItemLog(ItemLog itemLog)
        {
          if (_context.ItemLogs == null)
          {
              return Problem("Entity set 'TESTContext.ItemLogs'  is null.");
          }
            _context.ItemLogs.Add(itemLog);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ItemLogExists(itemLog.LogId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetItemLog", new { id = itemLog.LogId }, itemLog);
        }

        // DELETE: api/ItemLogs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteItemLog(int id)
        {
            if (_context.ItemLogs == null)
            {
                return NotFound();
            }
            var itemLog = await _context.ItemLogs.FindAsync(id);
            if (itemLog == null)
            {
                return NotFound();
            }

            _context.ItemLogs.Remove(itemLog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemLogExists(int id)
        {
            return (_context.ItemLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
