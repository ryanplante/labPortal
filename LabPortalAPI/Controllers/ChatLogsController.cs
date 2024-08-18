using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using System.Text;
using System.Security.Cryptography;
using LabPortal.Models.Dto;

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
        public async Task<ActionResult<IEnumerable<ChatLogDto>>> GetChatLogs()
        {
            if (_context.ChatLogs == null)
            {
                return NotFound();
            }
            var chatLogs = await _context.ChatLogs.ToListAsync();
            var chatLogDtos = chatLogs.Select(ChatLog => new ChatLogDto
            {
<<<<<<< HEAD
                //LogId = ChatLog.LogId,
=======
                LogId = ChatLog.LogId,
>>>>>>> main
                UserId = ChatLog.UserId,
                Message = ChatLog.Message,
                Timestamp = ChatLog.Timestamp
            }).ToList();

            return Ok(chatLogDtos);
        }

        // GET: api/ChatLogs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatLogDto>> GetChatLog(int id)
<<<<<<< HEAD
=======
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

            var chatLogDto = new ChatLogDto
            {
                LogId = chatLog.LogId,
                UserId = chatLog.UserId,
                Message = chatLog.Message,
                Timestamp = chatLog.Timestamp
            };

            return Ok(chatLogDto);
        }

        // PUT: api/ChatLogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutChatLog(int id, ChatLogDto chatLogDto)
        {
            if (id != chatLogDto.LogId)
            {
                return BadRequest();
            }

            var chatLog = await _context.ChatLogs.FindAsync(id);
            if (chatLog == null)
            {
                return NotFound();
            }

            chatLog.UserId = chatLogDto.UserId;
            chatLog.Message = chatLogDto.Message;
            chatLog.Timestamp = chatLogDto.Timestamp;

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
        public async Task<ActionResult<ChatLogDto>> PostChatLog(ChatLogDto chatLogDto)
        {
            if (_context.ChatLogs == null)
            {
                return Problem("Entity set 'TESTContext.ChatLogs'  is null.");
            }

            var chatLog = new ChatLog
            {
                UserId = chatLogDto.UserId,
                Message = chatLogDto.Message,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatLogs.Add(chatLog);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the chat log.");
            }

            return Ok();
        }

        // DELETE: api/ChatLogs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteChatLog(int id)
>>>>>>> main
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

            var chatLogDto = new ChatLogDto
            {
                //LogId = chatLog.LogId,
                UserId = chatLog.UserId,
                Message = chatLog.Message,
                Timestamp = chatLog.Timestamp
            };

            return Ok(chatLogDto);
        }

        // PUT: api/ChatLogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> PutChatLog(int id, ChatLogDto chatLogDto)
        //{
        //    if (id != chatLogDto.LogId)
        //    {
        //        return BadRequest();
        //    }

        //    var chatLog = await _context.ChatLogs.FindAsync(id);
        //    if (chatLog == null)
        //    {
        //        return NotFound();
        //    }

        //    chatLog.UserId = chatLogDto.UserId;
        //    chatLog.Message = chatLogDto.Message;
        //    chatLog.Timestamp = chatLogDto.Timestamp;

        //    _context.Entry(chatLog).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ChatLogExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}

        // POST: api/ChatLogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatLogDto>> PostChatLog(ChatLogDto chatLogDto)
        {
            if (_context.ChatLogs == null)
            {
                return Problem("Entity set 'TESTContext.ChatLogs'  is null.");
            }

            var chatLog = new ChatLog
            {
                UserId = chatLogDto.UserId,
                Message = chatLogDto.Message,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatLogs.Add(chatLog);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the chat log.");
            }

            return Ok();
        }

        //// DELETE: api/ChatLogs/5
        //[HttpDelete("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> DeleteChatLog(int id)
        //{
        //    if (_context.ChatLogs == null)
        //    {
        //        return NotFound();
        //    }
        //    var chatLog = await _context.ChatLogs.FindAsync(id);
        //    if (chatLog == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.ChatLogs.Remove(chatLog);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool ChatLogExists(int id)
        {
            return (_context.ChatLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}