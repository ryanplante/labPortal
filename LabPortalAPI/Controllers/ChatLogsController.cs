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
    public class ChatLogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public ChatLogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/ChatLogs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ChatLog>>> GetChatLogs()
        {
          if (_context.ChatLogs == null)
          {
              return NotFound();
          }
            return await _context.ChatLogs.ToListAsync();
        }

        // GET: api/ChatLogs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatLog>> GetChatLog(int id)
        {
          if (_context.ChatLogs == null)
          {
              return NotFound();
          }
            var chatLog = await _context.ChatLogs.FindAsync(id);

            if (chatLog == null)
            {
                return NotFound();
            }

            return chatLog;
        }

        // PUT: api/ChatLogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutChatLog(int id, ChatLog chatLog)
        {
            if (id != chatLog.LogId)
            {
                return BadRequest();
            }

            _context.Entry(chatLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChatLogExists(id))
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

        // POST: api/ChatLogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatLog>> PostChatLog(ChatLog chatLog)
        {
          if (_context.ChatLogs == null)
          {
              return Problem("Entity set 'TESTContext.ChatLogs'  is null.");
          }
            _context.ChatLogs.Add(chatLog);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ChatLogExists(chatLog.LogId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetChatLog", new { id = chatLog.LogId }, chatLog);
        }

        // DELETE: api/ChatLogs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteChatLog(int id)
        {
            if (_context.ChatLogs == null)
            {
                return NotFound();
            }
            var chatLog = await _context.ChatLogs.FindAsync(id);
            if (chatLog == null)
            {
                return NotFound();
            }

            _context.ChatLogs.Remove(chatLog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ChatLogExists(int id)
        {
            return (_context.ChatLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
