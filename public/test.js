const countdown = () => {

    const deadline = new Date("June 28, 2022 23:59:59").getTime();
    console.log(deadline);
    const now = new Date().getTime();
    const gap = deadline - now;

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    //calculate days, hours, minutes and seconds
    const days = Math.floor(gap / (day));
    const hours = Math.floor((gap % (day)) / (hour));
    const minutes = Math.floor((gap % (hour)) / (minute));
    const seconds = Math.floor((gap % (minute)) / second);

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;

    if (gap < 0) {
        clearInterval(countdown);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
    }
}

setInterval(countdown, 1000);
