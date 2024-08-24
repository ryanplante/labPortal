using Microsoft.AspNetCore.Mvc;
using System;

namespace LabPortal.Controllers
{
    // GET /api/Heartbeat
    // Gets the status of the api and its uptime
    [Route("api/[controller]")]
    [ApiController]
    public class HeartbeatController : ControllerBase
    {
        private readonly ApplicationLifetimeService _lifetimeService;

        public HeartbeatController(ApplicationLifetimeService lifetimeService)
        {
            _lifetimeService = lifetimeService;
        }

        [HttpGet()]
        public IActionResult GetStatus()
        {
            var uptime = DateTime.UtcNow - _lifetimeService.ApplicationStartTime;
            var result = new
            {
                Status = true,
                Uptime = uptime.ToString(@"dd\.hh\:mm\:ss")
            };
            return Ok(result);
        }
    }
}
