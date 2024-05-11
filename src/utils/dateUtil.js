//https://www.cnblogs.com/liuxianan/p/js-date-format-parse.html

import { isEmpty } from "./common"

/* eslint-disable */
export default {
    /**
     * 将日期格式化成指定格式的字符串
     * @param date 要格式化的日期，不传时默认当前时间，也可以是一个时间戳
     * @param fmt 目标字符串格式，支持的字符有：y,M,d,q,w,H,h,m,S，默认：yyyy-MM-dd HH:mm:ss
     * @returns 返回格式化后的日期字符串
     */
    format: (date, fmt) => {
        date = date == undefined ? new Date() : date
        date = typeof date == "number" ? new Date(date) : date
        fmt = fmt || "yyyy-MM-dd HH:mm:ss"
        var obj = {
            y: date.getFullYear(), // 年份，注意必须用getFullYear
            M: date.getMonth() + 1, // 月份，注意是从0-11
            d: date.getDate(), // 日期
            q: Math.floor((date.getMonth() + 3) / 3), // 季度
            w: date.getDay(), // 星期，注意是0-6
            H: date.getHours(), // 24小时制
            h: date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, // 12小时制
            m: date.getMinutes(), // 分钟
            s: date.getSeconds(), // 秒
            S: date.getMilliseconds(), // 毫秒
        }
        var week = ["天", "一", "二", "三", "四", "五", "六"]
        for (var i in obj) {
            fmt = fmt.replace(new RegExp(i + "+", "g"), function (m) {
                var val = obj[i] + ""
                if (i == "w") return (m.length > 2 ? "星期" : "周") + week[val]
                for (var j = 0, len = val.length; j < m.length - len; j++)
                    val = "0" + val
                return m.length == 1
                    ? val
                    : val.substring(val.length - m.length)
            })
        }
        return fmt
    },
    /**
     * 将字符串解析成日期
     * @param str 输入的日期字符串，如'2014-09-13'
     * @param fmt 字符串格式，默认'yyyy-MM-dd'，支持如下：y、M、d、H、m、s、S，不支持w和q
     * @returns 解析后的Date类型日期
     */
    parse: (str, fmt) => {
        fmt = fmt || "yyyy-MM-dd"
        var obj = { y: 0, M: 1, d: 0, H: 0, h: 0, m: 0, s: 0, S: 0 }
        fmt.replace(/([^yMdHmsS]*?)(([yMdHmsS])\3*)([^yMdHmsS]*?)/g, function (
            m,
            $1,
            $2,
            $3,
            $4,
            idx,
            old
        ) {
            str = str.replace(
                new RegExp($1 + "(\\d{" + $2.length + "})" + $4),
                function (_m, _$1) {
                    obj[$3] = parseInt(_$1)
                    return ""
                }
            )
            return ""
        })
        obj.M-- // 月份是从0开始的，所以要减去1
        var date = new Date(obj.y, obj.M, obj.d, obj.H, obj.m, obj.s)
        if (obj.S !== 0) date.setMilliseconds(obj.S) // 如果设置了毫秒
        return date
    },

    convertDateTimeStrFormat(dateStr, parseFormat, targetFormat) {
        try {
            return this.format(this.parse(dateStr, parseFormat), targetFormat)
        } catch (e) {
            throw new Error(`${dateStr} 从 ${parseFormat} 转换至 ${targetFormat}失败：${e}`)
        }
    },
    /**
     * 
     * @param {Date} base 
     * @param {Object} offset 
     */
    getOffsetDate(base, offset, toStr = true, fmt) {
        let defaultOffset = {
            years: 0,
            months: 0,
            days: 0
        }
        offset = Object.assign(defaultOffset, offset)

        let year = base.getFullYear()
        let month = base.getMonth()
        let day = base.getDate()

        let newYear = year + offset.years
        let newMonth = month + offset.months
        while (newMonth < 0) {
            newYear -= 1
            newMonth = 11 + newMonth
        }

        base.setFullYear(newYear)
        base.setMonth(newMonth)

        let offsetDate = new Date(base.getTime() + offset.days * 24 * 3600 * 1000)

        // console.log('offsetDate->',this.format(offsetDate,fmt || 'yyyy-MM-dd'))

        return toStr ? this.format(offsetDate, fmt || 'yyyy-MM-dd') : offsetDate
    },
    getOffsetDateOfToday(offset, toStr = true, fmt) {
        const base = new Date()
        return this.getOffsetDate(base, offset, toStr, fmt)
    },

    getThisMonthFirstDay(toStr = true) {
        let date = new Date().setDate(1)
        return toStr ? this.format(date, 'yyyy-MM-dd') : date
    },
    getThisMonthLastDay(toStr = true) {
        let date = new Date()
        let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        return toStr ? this.format(endDate, 'yyyy-MM-dd') : endDate
    },

    getCurrentYear() {
        return this.getCurrentDateTime('yyyy')
    },
    getCurrentDate(format = null) {
        return this.format(new Date(), format ?? 'yyyy-MM-dd')
    },

    getCurrentDateTime(format = null) {
        return this.format(new Date(), format ?? 'yyyy-MM-dd HH:mm:ss')
    },
    getCurrentYearMonth(sep = '-') {
        return this.format(new Date(), `yyyy${sep}MM`)
    },
    getWeeksInMonth(yearMonth) {
        let year = parseInt(yearMonth.split('-')[0])
        let month = parseInt(yearMonth.split('-')[1])
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const weeks = {};

        let currentWeek = 1;
        let currentDate = firstDay;
        while (currentDate <= lastDay) {
            let weekStartDate
            if (currentDate.getDay() === 1 || currentDate === firstDay) {
                weekStartDate = new Date(currentDate);
            }
            let daysfromSunday = currentDate.getDay() == 0 ? 0 : (7 - currentDate.getDay())
            const weekEndDate = new Date(Math.min(currentDate.setDate(currentDate.getDate() + daysfromSunday), lastDay));
            let days = (weekEndDate - weekStartDate) / (1000 * 60 * 60 * 24) + 1
            weeks[currentWeek] = { week: currentWeek, days, start: this.format(weekStartDate, 'yyyy-MM-dd'), end: this.format(weekEndDate, 'yyyy-MM-dd') };
            currentDate.setDate(currentDate.getDate() + 1);
            currentWeek++;
        }

        return weeks;
    },

    getLastWeek(baseDate = null) {
        // 将传入的日期字符串转换为日期对象
        let date = baseDate ? new Date(baseDate) : new Date();
        // 获取日期的年份、月份和日期
        // const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // 设置日期为上一周的同一天
        date.setDate(day - 7);

        // 获取上一周的年份和月份
        let lastWeekYear = date.getFullYear();
        let lastWeekMonth = date.getMonth();
        let lastWeekNumber

        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const firstDayOfFirstWeek = new Date(firstDayOfMonth).setDate(firstDayOfMonth.getDate() - (firstDayOfMonth.getDay() - 1))

        if (lastWeekMonth != month) {
            const lastDayOfLastWeek = new Date(date)
            lastDayOfLastWeek.setDate(date.getDate() + (date.getDay() == 0 ? 0 : (7 - date.getDay())))
            if (lastDayOfLastWeek.getMonth() != lastWeekMonth) {
                lastWeekYear = lastDayOfLastWeek.getFullYear()
                lastWeekMonth = lastDayOfLastWeek.getMonth()
                lastWeekNumber = 1
                return { yearMonth: lastWeekYear + '-' + (lastWeekMonth + 1 <= 9 ? `0${lastWeekMonth + 1}` : lastWeekMonth + 1), week: lastWeekNumber }
            } else {
                //跨月了就取上个月最后一周
                const firstDayOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
                date = new Date(firstDayOfNextMonth.getTime() - 1);
            }
        }
        // 计算时间差值（毫秒），并将其转换为天数
        const timeDiff = Math.floor((date - firstDayOfFirstWeek) / (1000 * 3600 * 24));

        // 加上起始日期的一天
        const daysDiff = timeDiff + 1;

        lastWeekNumber = Math.ceil(daysDiff / 7)

        // 返回上一周所在月份及其周数
        return { yearMonth: lastWeekYear + '-' + (lastWeekMonth + 1 <= 9 ? `0${lastWeekMonth + 1}` : lastWeekMonth + 1), week: lastWeekNumber }
    },

    getQuarter(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        const quarter = Math.ceil(month / 3);
        return `${year}-${quarter}`;
    },

    getCurrentWeek() {
        const yearMonth = this.getCurrentYearMonth();
        const weeks = this.getWeeksInMonth(yearMonth);

        const today = new Date();
        const todayStr = this.format(today, 'yyyy-MM-dd');

        for (const week of Object.values(weeks)) {
            if (todayStr >= week.start && todayStr <= week.end) {
                return week.week;
            }
        }
        return null; // 如果找不到当前周
    },
    getWeekInfo(weekString) {
        const yearMonth = weekString.substring(0, 7);
        const week = parseInt(weekString.charAt(8));
        const weeksInMonth = this.getWeeksInMonth(yearMonth);
        return weeksInMonth[week];
    },

    isValidExcelDateNumber(num) {
        // 定义一个合理的日期范围，这里假设在1900年1月1日之后的日期是合理的
        const minValidDateNumber = 0
        const today = new Date();
        const excelStartDate = new Date(1900, 0, 1);
        const maxValidDateNumber = (today.getTime() - excelStartDate.getTime() - today.getTimezoneOffset() * 60 * 1000) / (24 * 60 * 60 * 1000) + 1;
        return !isNaN(num) && num >= minValidDateNumber && num <= maxValidDateNumber
    },
    formatNumberDate(num) {
        let format = 'yyyy-MM-dd'
        if (this.isValidExcelDateNumber(num)) {
            if (Number.isInteger(num)) {
                format = 'yyyy-MM-dd'
            } else {
                format = 'yyyy-MM-dd HH:mm:ss'
            }
        } else {
            return
        }
        const old = num - 1
        const t = Math.round((old - Math.floor(old)) * 24 * 60 * 60)
        const time = new Date(1900, 0, old, 0, 0, t)
        return this.format(time, format)
    }
}
