using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SchedulerTryOut.Data;
using SchedulerTryOut.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace SchedulerTryOut.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private AppDbContext db;

        public HomeController(ILogger<HomeController> logger, AppDbContext _db)
        {
            _logger = logger;
            db = _db;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Route("findall")]
        public JsonResult FindAllEvents() 
        {
            var events = db.Events.Select(e => new
            {
                id = e.Id,
                title = e.Subject,
                description = e.Description,
                start = e.Start.ToString(),
                end = e.End.ToString(),
                color = e.ThemeColor,
                allDay = e.IsFullDay
            }).ToList();
            return new JsonResult(events);
        }
        [HttpPost]
        public JsonResult SaveEvent(Events e) 
        {
            var status = false;
            ModelState.Clear();
            if (TryValidateModel(e))
            {
                if (e.Id > 0)
                {
                    var v = db.Events.Where(a => a.Id == e.Id).First();
                    if (v != null)
                    {
                        v.Subject = e.Subject;
                        v.Description = e.Description;
                        v.Start = e.Start;
                        v.End = e.End;
                        v.ThemeColor = e.ThemeColor;
                        v.IsFullDay = e.IsFullDay;
                        if (e.ThemeColor == null)
                        {
                            switch (e.Subject)
                            {
                                case "school":
                                    v.ThemeColor = "red";
                                    break;
                                case "verlof":
                                    v.ThemeColor = "blue";
                                    break;
                                default:
                                    v.ThemeColor = "green";
                                    break;
                            }
                        }
                    }
                }
                else
                {
                    switch (e.Subject)
                    {
                        case "school":
                            e.ThemeColor = "red";
                            break;
                        case "verlof":
                            e.ThemeColor = "blue";
                            break;
                        default:
                            e.ThemeColor = "green";
                            break;
                    }
                    db.Events.Add(e);
                }

                db.SaveChanges();
                status = true;
            }
            return new JsonResult(status);
        }

        [HttpPost]
        public JsonResult DeleteEvent(int eventID) 
        {
            var status = false;
            var v = db.Events.Where(a => a.Id == eventID).First();
            if (v != null)
            {
                db.Events.Remove(v);
                db.SaveChanges();
                status = true;
            }
            return new JsonResult(status);
        }

        public JsonResult AddEventToXWeeks(DateTime start, DateTime end, int weeks, List<string> subjects) 
        {
            var status = false;
            var v = db.Events.Where(e => e.Start >= start && e.Start <= end && subjects.Contains(e.Subject)).ToList();
            var events = new List<Events>();
            foreach (var _event in v)
            {
                for (int i = 1; i <= weeks; i++)
                {
                    Events newEvent = new Events();
                    newEvent.Id = 0;
                    newEvent.Start = _event.Start.AddDays(7 * i);
                    newEvent.End = _event.End?.AddDays(7 * i);
                    newEvent.Subject = _event.Subject;
                    newEvent.Description = _event.Description;
                    newEvent.ThemeColor = _event.ThemeColor;
                    newEvent.IsFullDay = _event.IsFullDay;
                    events.Add(newEvent);
                }
            }
            db.Events.AddRange(events);
            db.SaveChanges();
            status = true;
            return new JsonResult(status);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
