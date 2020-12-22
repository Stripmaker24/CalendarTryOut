var calendarEl = document.getElementById('calendar');
var button = document.createElement("button");
var fieldLabel = document.createElement("label");
var fieldLabelText = document.createTextNode("Rede van verlof:");
var field = document.createElement("textarea");
button.innerHTML = "Verwijderen";
button.className = "btn btn-danger";
fieldLabel.appendChild(fieldLabelText);


var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: '',
        center: 'prev title next',
        right: 'CloneForWeek'
    },
    titleFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    },
    dayHeaderFormat: {
        weekday: 'long'
    },
    allDaySlot: true,
    locales: 'nl',
    firstDay: 1,
    weekText: "Week",
    nowIndicator: true,
    selectable: true,
    editable: true,
    events: "https://localhost:44354/findall",
    eventDrop: function (info) {
        DropEvent(info);
    },
    eventResize: function (info) {
        ResizeEvent(info);
    },
    eventClick: function (info) {
        ClickEvent(info);
    },
    dateClick: function (info) {
        ClickDate(info);
    },
    customButtons: {
        CloneForWeek: {
            text: "Vastzetten",
            click: function () {
                $("#pop-up-perm").modal("show");
            }
        }
    }
});

RenderCalendar();

function RenderCalendar() {
        document.addEventListener('DOMContentLoaded', function () {
            calendar.render();
        });
    };

document.getElementById("eventSubject").addEventListener("change", function () {
    if (document.getElementById("eventSubject").value == "verlof") {
        document.getElementById("RL").appendChild(fieldLabel);
        document.getElementById("form-cud").appendChild(field);
    } else
    {
        if (document.getElementById("form-cud").contains(field)) {
            document.getElementById("RL").removeChild(fieldLabel);
            document.getElementById("form-cud").removeChild(field);
            field.value = null;
        }
    }
})

document.getElementById("start-time").addEventListener("change", function() {
    var str = document.getElementById("start-time").value;
    document.getElementById("end-time").min = ParseDate(RevertDateAddMinute(str));
});

document.getElementById("save-btn-cud").addEventListener("click", function () {
    SaveEvent(getDataOfCud());
});

document.getElementById("save-btn-perm").addEventListener("click", function () {
    AddEventsToWeeks(getDataOfPerm());
});

button.addEventListener("click", function () {
    DeleteEvent();
});

function ClickDate(info) {
    document.getElementById("start-time").value = ParseDate(info.date);
    document.getElementById("end-time").min = ParseDate(RevertDateAddMinute(document.getElementById("start-time").value));
    document.getElementById("button-field-cud").appendChild(button)
    document.getElementById("eventId").value = null;
    document.getElementById("end-time").value = null;
    document.getElementById("is-full-day").checked = null;
    if (document.getElementById("eventSubject").value == "verlof") {
        document.getElementById("RL").appendChild(fieldLabel);
        document.getElementById("form-cud").appendChild(field);
        field.value = null;
    }
    if (document.getElementById("button-field-cud").contains(button)) {
        document.getElementById("button-field-cud").removeChild(button);
    }
    document.getElementById("start-time").min = ParseDate(new Date(Date.now()));
    $("#pop-up-cud").modal("show");
}

function ClickEvent(info) {
    var data = {
        Id: info.event.id,
        Subject: info.event.title,
        Start: ParseDate(info.event.start),
        End: info.event.allDay ? null : info.event.end != null ? ParseDate(info.event.end) : null,
        IsFullDay: info.event.allDay,
        ThemeColor: info.event.backgroundColor,
        Description: info.event.extendedProps.description
    }
    document.getElementById("button-field-cud").appendChild(button)
    document.getElementById("eventId").value = data.Id;
    document.getElementById("start-time").value = data.Start
    document.getElementById("end-time").min = ParseDate(RevertDateAddMinute(document.getElementById("start-time").value));
    document.getElementById("end-time").value = data.End;
    document.getElementById("is-full-day").checked = data.IsFullDay;
    document.getElementById(data.Subject).selected = true;
    if (document.getElementById("eventSubject").value == "verlof") {
        document.getElementById("RL").appendChild(fieldLabel);
        document.getElementById("form-cud").appendChild(field);
        field.value = data.Description
    } else {
        if (document.getElementById("form-cud").contains(field)) {
            document.getElementById("RL").removeChild(fieldLabel);
            document.getElementById("form-cud").removeChild(field);
            field.value = null;
        }
    }
    $("#pop-up-cud").modal("show");
}

function DropEvent(info)
{
    var data = {
        Id: info.event.id,
        Subject: info.event.title,
        Start: ParseDate(info.event.start),
        End: info.event.allDay ? null : info.event.end != null ? ParseDate(info.event.end) : null,
        IsFullDay: info.event.allDay,
        ThemeColor: info.event.backgroundColor,
        Description: info.event.extendedProps.description
    }
    SaveEvent(data);
}

function ResizeEvent(info)
{
    var data = {
        Id: info.event.id,
        Subject: info.event.title,
        Start: ParseDate(info.event.start),
        End: info.event.allDay ? null : ParseDate(info.event.end),
        IsFullDay: info.event.allDay,
        ThemeColor: info.event.backgroundColor,
        Description: info.event.extendedProps.description
    }
    SaveEvent(data);
}

function getDataOfPerm() {
    var data = {
        start: GetFirstDate(),
        end: GetLastDate(),
        weeks: $("#week-count").val(),
        subjects: [$("#school-check").is(":checked") ? $("#school-check").val() : null
            , $("#verlof-check").is(":checked") ? $("#verlof-check").val() : null
            , $("#overig-check").is(":checked") ? $("#overig-check").val() : null]

    }
    return data;
}

function getDataOfCud() {
    var data = {
        Id: $("#eventId").val(),
        Subject: $("#eventSubject").val(),
        Start: $("#start-time").val(),
        End: $("#is-full-day").is(":checked") ? null : $("#end-time").val(),
        IsFullDay: $("#is-full-day").is(":checked") ? true : false,
        Description: function () {
            if (document.getElementById("form-cud").contains(field)) {
                return field.value;
            }
            return null;
        }
    }
    return data;
};

function DeleteEvent() {
    if (confirm('Are you sure?')) {
        $.ajax({
            type: "POST",
            url: '/Home/DeleteEvent',
            data: { 'eventID': $("#eventId").val()},
            success: function (status) {
                calendar.refetchEvents()
                $("#pop-up-cud").modal("hide");
            },
            error: function () {
                alert('Failed');
            }
        })
    }
};

function AddEventsToWeeks(data) {
    $.ajax({
        type: "POST",
        url: '/Home/AddEventToXWeeks',
        data: data,
        success: function (status) {
            alert('Success');
            $("#pop-up-perm").modal("hide");
        },
        error: function () {
            alert('Failed');
        }
    })
};

function SaveEvent(data) {
    $.ajax({
        type: "POST",
        url: '/Home/SaveEvent',
        data: data,
        success: function (status) {
            if (status) {
                calendar.refetchEvents()
                $("#pop-up-cud").modal("hide");
            }
        },
        error: function () {
            alert('Failed');
        }
    })
};

function ParseDate(date) {
    if (date.getHours() < 10) {
        var hour = "0" + date.getHours();
    }
    else {
        var hour = date.getHours();
    }

    if (date.getMinutes() < 10) {
        var min = "0" + date.getMinutes();
    }
    else {
        var min = date.getMinutes();
    }
    if (date.getDate() < 10) {
        var day = "0" + date.getDate();
    }
    else {
        var day = date.getDate();
    }
    if (date.getMonth() + 1 < 10) {
        var month = "0" + (date.getMonth() + 1);
        console.log(month);
    }
    else {
        var month = date.getMonth() + 1;
    }
    var str = date.getFullYear() + "-" + month + "-" + day + "T" + hour + ":" + min;
    return str;
};

function RevertDateAddMinute(string) {
    var split1 = string.split("-");
    var split2 = split1[2].split("T");
    var split3 = split2[1].split(":");
    var date = new Date(split1[0], split1[1] - 1, split2[0], split3[0], split3[1]);
    date.setMinutes(date.getMinutes() + 1);
    var finalDate = new Date(date);
    return finalDate;
};

function GetFirstDate() {
    return ParseDate(calendar.view.activeStart);
}

function GetLastDate() {
    var t = calendar.view.activeEnd - 1;
    var endDate = new Date(t);
    return ParseDate(endDate);
}