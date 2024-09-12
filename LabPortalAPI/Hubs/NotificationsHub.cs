using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace LabPortal.Hubs
{
    public class NotificationsHub : Hub
    {
        // Dictionary to store connection-to-user mapping for notifications
        private static ConcurrentDictionary<string, string> _connectionToUserMap = new ConcurrentDictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            // Add user to the notifications group
            await Groups.AddToGroupAsync(Context.ConnectionId, "Notifications");
            Console.WriteLine($"User {Context.ConnectionId} connected to Notifications");

            // Add user to the connection map
            _connectionToUserMap.TryAdd(Context.ConnectionId, Context.ConnectionId);

        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove user from notifications group and connection map
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Notifications");
            _connectionToUserMap.TryRemove(Context.ConnectionId, out _);

            Console.WriteLine($"User {Context.ConnectionId} disconnected from Notifications");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task GetStudentCount(int deptId)
        {
            // Filter students based on the department
            try
            {
                var studentCount = ChatHub.waitingStudents.Count(student => student.UserDept == deptId);
                await Clients.Caller.SendAsync("student_count", studentCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

        }

        public async Task GetStatuses(int deptId)
        {
            try
            {
                // Check if there are any tutors available in the specified department
                var isTutorAvailable = ChatHub.waitingTutors.Any(tutor => tutor.UserDept == deptId);

                // Get the count of students waiting in the same department
                var studentCount = ChatHub.waitingStudents.Count(student => student.UserDept == deptId);

                // Send both tutor availability and student count back to the client
                await Clients.Caller.SendAsync("student_count", studentCount);
                await Clients.Caller.SendAsync("tutor_count", isTutorAvailable);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }


        public async Task CheckTutorAvailability(int deptId)
        {
            try
            {
                // Check if there are any tutors available in the specified department
                var isTutorAvailable = ChatHub.waitingTutors.Any(tutor => tutor.UserDept == deptId);
                await Clients.Caller.SendAsync("tutor_count", isTutorAvailable);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        // Method to get the count of connected users for notifications
        public int GetConnectedUserCount()
        {
            return _connectionToUserMap.Count;
        }
    }
}
