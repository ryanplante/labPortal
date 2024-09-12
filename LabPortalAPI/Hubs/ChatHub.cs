using LabPortal.Models.Dto;
using LabPortal.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Timers;
using Microsoft.EntityFrameworkCore;

namespace LabPortal.Hubs
{

    public class ChatHub : Hub
    {
        private readonly TESTContext _context;
        private readonly IHubContext<NotificationsHub> _notificationsHubContext;
        // Dictionary to store connection id to user mapping <connection, userData>
        private static ConcurrentDictionary<string, UserDto> _connectedUsers = new ConcurrentDictionary<string, UserDto>();

        // Dictionary to store connection id to room name mapping
        private static ConcurrentDictionary<string, string> _userRooms = new ConcurrentDictionary<string, string>();

        // Queues for waiting students and tutors by department
        public static ConcurrentQueue<UserDto> waitingTutors = new ConcurrentQueue<UserDto>();
        public static ConcurrentQueue<UserDto> waitingStudents = new ConcurrentQueue<UserDto>();

        // Timer to check their inactivity status
        private static System.Timers.Timer? _inactivityCheckTimer;
        // Dictionary to store connection id
        private static ConcurrentDictionary<string, DateTime> _lastPingTimes = new ConcurrentDictionary<string, DateTime>();
        public ChatHub(TESTContext context, IHubContext<NotificationsHub> notificationsHubContext)
        {
            _context = context;
            _notificationsHubContext = notificationsHubContext;  // Injected NotificationsHub context

            // Setup inactivity check timer (check every minute)
            if (_inactivityCheckTimer == null)
            {
                _inactivityCheckTimer = new System.Timers.Timer(15000); // 15 second time out to give user a chance to connect back in case of network issues, app crash, etc.
                _inactivityCheckTimer.Elapsed += (sender, e) => CheckForInactiveUsers();
                _inactivityCheckTimer.Start();
            }
        }

        public override async Task OnConnectedAsync()
        {
            // Upon connection, emit a request to get user info. They initially connect as anonymous users
            await Clients.Caller.SendAsync("requestUserInfo");
            Console.WriteLine($"User {Context.ConnectionId} connected to Chat");
            _lastPingTimes[Context.ConnectionId] = DateTime.UtcNow;
            await base.OnConnectedAsync();
        }

        private async Task RemoveUserFromRoom(string connectionId, string reason)
        {
            if (_connectedUsers.TryRemove(connectionId, out var user))
            {
                // Remove the user from the last ping times dictionary
                _lastPingTimes.TryRemove(connectionId, out _);

                if (user.IsTeacher ?? false || user.PrivLvl >= 2)
                {
                    waitingTutors = new ConcurrentQueue<UserDto>(waitingTutors.Where(u => u.UserId != user.UserId));
                    await _notificationsHubContext.Clients.All.SendAsync("tutor_count", waitingTutors.Any());
                }
                else
                {
                    waitingStudents = new ConcurrentQueue<UserDto>(waitingStudents.Where(u => u.UserId != user.UserId));
                    await _notificationsHubContext.Clients.All.SendAsync("student_count", waitingStudents.Count);
                }

                // Try to remove the user from the room
                if (_userRooms.TryRemove(connectionId, out var roomName))
                {
                    // Find the other user in the room (if any)
                    var otherUserConnectionId = _userRooms.FirstOrDefault(x => x.Value == roomName && x.Key != connectionId).Key;

                    // If there is another user in the room
                    if (!string.IsNullOrEmpty(otherUserConnectionId))
                    {
                        // Remove the other user from the room and the connected users
                        _userRooms.TryRemove(otherUserConnectionId, out _);

                        // Remove the other user from the group
                        await Groups.RemoveFromGroupAsync(otherUserConnectionId, roomName);

                        var otherUser = _connectedUsers[otherUserConnectionId];
                        // Remove the other user from the connected users list
                        _connectedUsers.TryRemove(otherUserConnectionId, out _);
                        // Notify the other user why their partner disconnected
                        await Clients.Client(otherUserConnectionId).SendAsync("disconnectUser", reason);
                        // Remove the other user from the waiting queues
                        if (otherUser.IsTeacher ?? false || otherUser.PrivLvl >= 2)
                        {
                            waitingTutors = new ConcurrentQueue<UserDto>(waitingTutors.Where(u => u.UserId != otherUser.UserId));
                            await _notificationsHubContext.Clients.All.SendAsync("tutor_count", waitingTutors.Any());
                        }
                        else
                        {
                            waitingStudents = new ConcurrentQueue<UserDto>(waitingStudents.Where(u => u.UserId != otherUser.UserId));
                            await _notificationsHubContext.Clients.All.SendAsync("student_count", waitingStudents.Count);
                        }

                        Console.WriteLine($"Other user with connectionId {otherUserConnectionId} removed from room {roomName}.");
                    }

                    // Remove the original user from the group
                    await Groups.RemoveFromGroupAsync(connectionId, roomName);

                    // Notify the original user of disconnection
                    await Clients.Client(connectionId).SendAsync("disconnectUser", "You have been removed from the chat room.");

                    Console.WriteLine($"User {user.UserId} removed from room {roomName}.");
                }
            }
            else
            {
                Console.WriteLine($"ConnectionId {connectionId} not found in connected users.");
            }
        }




        public async Task JoinChatLobby(int userId)
        {
            try
            {
                if (_connectedUsers.Values.Any(u => u.UserId == userId))
                {
                    await Clients.Caller.SendAsync("duplicateUser", "Another session with this user ID is already active.");
                    Context.Abort();
                    return;
                }

                var ban = await _context.Bans
                    .Where(b => b.UserId == userId && b.ExpirationDate > DateTime.UtcNow)
                    .FirstOrDefaultAsync();

                if (ban != null)
                {
                    // If the user is banned, disconnect them
                    await Clients.Caller.SendAsync("kicked", $"You are banned from using this function for {ban.Reason} until {ban.ExpirationDate?.ToLocalTime():MM/dd/yyyy hh:mm tt}");
                    Console.WriteLine($"User {userId} is banned and was removed from the chat.");
                    Context.Abort();
                    return;
                }

                // Fetch full user details from the database
                var user = await _context.Users
                    .Where(u => u.UserId == userId)
                    .Select(u => new UserDto
                    {
                        UserId = u.UserId,
                        FName = u.FName,
                        LName = u.LName,
                        UserDept = u.UserDept,
                        PrivLvl = u.PrivLvl,
                        Position = u.Position,
                        IsTeacher = u.IsTeacher
                    })
                    .FirstOrDefaultAsync();

                _connectedUsers.TryAdd(Context.ConnectionId, user);
                _lastPingTimes[Context.ConnectionId] = DateTime.UtcNow; // Mark user as active
                await MatchUser(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in JoinChatLobby: {ex.Message}");
                await Clients.Caller.SendAsync("error", $"An error occurred: {ex.Message}");
            }
        }

        public async Task Ping()
        {
            _lastPingTimes[Context.ConnectionId] = DateTime.UtcNow; // Update last ping time
        }


        private async Task CheckForInactiveUsers()
        {
            var timeoutDuration = TimeSpan.FromSeconds(15);

            // Checks the dictionary of users who haven't pinged the server every 15 seconds
            var inactiveUsers = _lastPingTimes
                .Where(kv => DateTime.UtcNow - kv.Value > timeoutDuration)
                .Select(kv => kv.Key)
                .ToList();

            foreach (var connectionId in inactiveUsers)
            {
                // Use the RemoveUserFromRoom helper function to handle both the user and their partner if necessary
                await RemoveUserFromRoom(connectionId, "Inactivity");

                Console.WriteLine($"User with connectionId {connectionId} has been removed due to inactivity.");
            }

            // After removing inactive users, check all rooms for empty or single occupancy
            var roomGroups = _userRooms.GroupBy(x => x.Value).ToList();

            foreach (var roomGroup in roomGroups)
            {
                var roomName = roomGroup.Key;
                var usersInRoom = roomGroup.Select(x => x.Key).ToList();

                if (usersInRoom.Count == 0)
                {
                    // If the room is empty, just delete the room
                    Console.WriteLine($"Room {roomName} is empty and will be removed.");
                }
                else if (usersInRoom.Count == 1)
                {
                    // If only one user remains in the room, remove them
                    var remainingUserConnectionId = usersInRoom.First();
                    Console.WriteLine($"Room {roomName} has only one user left. Removing user with connectionId {remainingUserConnectionId}.");

                    // Remove the remaining user from the room
                    await RemoveUserFromRoom(remainingUserConnectionId, "Your partner disconnected.");
                }
            }
        }


        // Function to match the students/teachers in the queue with a partner
        private async Task MatchUser(UserDto user)
        {
            // Try to match the user based on their role (teacher/tutor or student)
            if (user.IsTeacher ?? false || user.PrivLvl >= 2)
            {
                // If the user is a teacher/tutor, try to match with a student
                if (waitingStudents.TryDequeue(out var student))
                {
                    // If a match is found, create a chat room
                    await CreateChatRoom(user, student);

                }
                else
                {
                    // No students found, enqueue the tutor and inform them they're waiting
                    waitingTutors.Enqueue(user);
                    await Clients.Caller.SendAsync("waitingForMatch", "No students available!");
                    

                }
            }
            else
            {
                // If the user is a student, try to match with a teacher/tutor
                if (waitingTutors.TryDequeue(out var tutor))
                {
                    // If a match is found, create a chat room
                    await CreateChatRoom(user, tutor);
                }
                else
                {
                    // No tutors found, enqueue the student and inform them they're waiting
                    waitingStudents.Enqueue(user);
                    await Clients.Caller.SendAsync("waitingForMatch", "No tutors available!");
                }
            }
            // Notify student count
            await _notificationsHubContext.Clients.All.SendAsync("student_count", waitingStudents.Count);
            await _notificationsHubContext.Clients.All.SendAsync("tutor_count", waitingTutors.Any());

        }



        private async Task CreateChatRoom(UserDto student, UserDto tutor)
        {
            var roomName = $"{tutor.UserDept}_Room_{tutor.UserId}_{student.UserId}";

            _userRooms[Context.ConnectionId] = roomName;
            _userRooms[GetConnectionIdForUser(student)] = roomName;

            await Groups.AddToGroupAsync(GetConnectionIdForUser(tutor), roomName);
            await Groups.AddToGroupAsync(GetConnectionIdForUser(student), roomName);

            await Clients.Client(GetConnectionIdForUser(tutor))
                .SendAsync("movedToRoom", $"[Student] {student.FName} {student.LName}");
            await Clients.Client(GetConnectionIdForUser(student))
                .SendAsync("movedToRoom", $"[Tutor] {tutor.FName} {tutor.LName}");
        }

        // Kick a user by their userId
        public async Task KickUser(int userId)
        {
            // Find their session id based on iser od
            var connectionId = _connectedUsers.FirstOrDefault(x => x.Value.UserId == userId).Key;

            if (!string.IsNullOrEmpty(connectionId))
            {
                // Inform the user they are being kicked
                await Clients.Client(connectionId).SendAsync("kicked", "You have been removed from the chat.");

                // Remove the user from their current room
                await RemoveUserFromRoom(connectionId, "Kicked");
                Console.WriteLine($"User {userId} has been kicked and disconnected.");
            }
            else
            {
                Console.WriteLine($"User {userId} not found.");
            }
        }

        private string GetConnectionIdForUser(UserDto user)
        {
            return _connectedUsers.FirstOrDefault(x => x.Value.UserId == user.UserId).Key;
        }

        public async Task LeaveChatLobby()
        {
            await RemoveUserFromRoom(Context.ConnectionId, "User disconnected");
        }

        public async Task GetConnectedUsers()
        {
            var connectedUsersList = _connectedUsers.Values.ToList();
            await Clients.Caller.SendAsync("connectedUsers", connectedUsersList); 
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;

            // Check if the user exists in the connected users list
            if (_connectedUsers.TryGetValue(connectionId, out var user))
            {
                // Remove the user from the appropriate waiting queue (tutors or students)
                if (user.IsTeacher ?? false || user.PrivLvl >= 2)
                {
                    waitingTutors = new ConcurrentQueue<UserDto>(waitingTutors.Where(u => u.UserId != user.UserId));
                    await _notificationsHubContext.Clients.All.SendAsync("tutor_count", waitingTutors.Any());
                }
                else
                {
                    waitingStudents = new ConcurrentQueue<UserDto>(waitingStudents.Where(u => u.UserId != user.UserId));
                    await _notificationsHubContext.Clients.All.SendAsync("student_count", waitingStudents.Count);
                }

                // Remove the disconnected user from connected users and ping times
                _connectedUsers.TryRemove(connectionId, out _);
                _lastPingTimes.TryRemove(connectionId, out _);

                // Check if the user was in a room and remove them and their partner if present
                if (_userRooms.TryRemove(connectionId, out var roomName))
                {
                    var otherUserConnectionId = _userRooms.FirstOrDefault(x => x.Value == roomName && x.Key != connectionId).Key;

                    // If there is another user in the room, handle their removal
                    if (!string.IsNullOrEmpty(otherUserConnectionId))
                    {
                        // Remove the other user from connected users and ping times lists
                        _connectedUsers.TryRemove(otherUserConnectionId, out _);
                        _lastPingTimes.TryRemove(otherUserConnectionId, out _);

                        // Remove the other user from the group and room
                        await Groups.RemoveFromGroupAsync(otherUserConnectionId, roomName);
                        _userRooms.TryRemove(otherUserConnectionId, out _);

                        // Notify the other user that their partner has disconnected and they need to rejoin
                        await Clients.Client(otherUserConnectionId).SendAsync("disconnectUser", "Your partner has disconnected. Please rejoin the chat.");

                        Console.WriteLine($"User {otherUserConnectionId} was removed from the room {roomName} due to the disconnection of their partner.");
                    }
                }

                Console.WriteLine($"User {user.UserId} has been disconnected and removed.");
            }

            // Call the base method to complete the disconnection process
            await base.OnDisconnectedAsync(exception);
        }




        public async Task SendMessage(string message)
        {
            if (_connectedUsers.TryGetValue(Context.ConnectionId, out var user) &&
                _userRooms.TryGetValue(Context.ConnectionId, out var roomName))
            {
                // Log the message to the database
                var chatLog = new ChatLog
                {
                    RoomName = roomName,
                    UserId = user.UserId,
                    Message = message,
                    Timestamp = DateTime.UtcNow
                };

                try
                {
                    // Add the message log to the database context and save
                    _context.ChatLogs.Add(chatLog);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error saving chat log: {ex.Message}");
                    // Optionally send an error message back to the user
                    await Clients.Caller.SendAsync("error", "An error occurred while saving the chat log.");
                }

                // Send the message to the group (room)
                await Clients.Group(roomName).SendAsync("receiveMessage", user.UserId, message);
            }
        }


    }
}
