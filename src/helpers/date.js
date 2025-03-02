
import moment from 'moment';

export function timeAgoFromNow(dateStrUTC) {
  let ago = moment.utc(dateStrUTC).local().fromNow();
  ago = ago.replace(/in a few seconds/, 'just now');
  ago = ago.replace(/a few seconds ago/, 'just now');
  ago = ago.replace(/\sseconds|\ssecond/, 'S');
  ago = ago.replace(/a minute/, '1m');
  ago = ago.replace(/\sminutes|\sminute/, 'm');
  ago = ago.replace(/an hour/, '1h');
  ago = ago.replace(/\shours|\shour/, 'h');
  ago = ago.replace(/a day/, '1d');
  ago = ago.replace(/\sdays|\sday/, 'd');
  ago = ago.replace(/a month/, '1mo');
  ago = ago.replace(/\smonths|\smonth/, 'mo');
  ago = ago.replace(/a year/, '1yr');
  ago = ago.replace(/\syears|\syear/, 'yr');
  return ago;
}

export function needsTimeAgoFromNow(dateStrUTC) {
  let ago = moment.utc(dateStrUTC).local().fromNow();
  ago = ago.replace(/\sseconds|\ssecond/, ' seconds');
  ago = ago.replace(/a minute/, '1 minute');
  ago = ago.replace(/an hour/, '1 hour');
  ago = ago.replace(/a day/, '1 day');
  ago = ago.replace(/a month/, '1 month');
  ago = ago.replace(/a year/, '1 year');
  return ago;
}

export function getTimeDifference(dateStrUTC) {
  try {
    return moment.duration(moment(new Date()).diff(moment(dateStrUTC))).asMinutes();
  } catch (e) {}
  return 99999999;
}

export function getTimer(now, date, from) {
  const diffTime = date.diff(now, 'millisecond');
  const duration = moment.duration(diffTime, 'milliseconds');
  const days = Math.abs(duration.days()) || 0;
  const hours = Math.abs(duration.hours()) || 0;
  const minutes = Math.abs(duration.minutes()) || 0;
  const seconds = Math.abs(duration.seconds()) || 0;

  if (diffTime <= 0) {
    return {
      late: diffTime < 0,
      diffTime,
      text: from === 'game' ? '0h 0m 0s' : null,
    };
  }
  return {
    late: diffTime < 0,
    diffTime,
    text:
      from === 'game'
        ? days === 0
          ? `${hours}h ${minutes}m ${seconds}s`
          : `${days}d ${hours}h ${minutes}m ${seconds}s`
        : days === 0
          ? hours === 0
            ? `${minutes}min`
            : `${hours}h ${minutes}min`
          : `${days}d ${hours}h ${minutes}min`,
  };
}

export function getTimerForGameStarted(now, date, from) {
  const diffTime = date.diff(now, 'millisecond');
  const duration = moment.duration(diffTime, 'milliseconds');
  const days = Math.abs(duration.days()) || 0;
  const hours = Math.abs(duration.hours()) || 0;
  const minutes = Math.abs(duration.minutes()) || 0;
  const seconds = Math.abs(duration.seconds()) || 0;

  if (diffTime <= 0) {
    return {
      late: true,
      diffTime,
      text: from === 'game' ? '0h 0m 0s' : null,
    };
  }
  return {
    late: true,
    diffTime,
    text:
      from === 'game'
        ? days === 0
          ? `${hours}h ${minutes}m ${seconds}s`
          : `${days}d ${hours}h ${minutes}m ${seconds}s`
        : days === 0
          ? hours === 0
            ? `${minutes}min`
            : `${hours}h ${minutes}min`
          : `${days}d ${hours}h ${minutes}min`,
  };
}

export function getTimerWithReverseTime(dateStr) {
  const now = moment();
  const date = moment.utc(dateStr).local();

  const isAfter = moment(now).isAfter(date);
  const diffTime = date.diff(now, 'millisecond');
  const duration = moment.duration(diffTime, 'milliseconds');
  const days = Math.abs(duration.days()) || 0;
  const hours = Math.abs(duration.hours()) || 0;
  const minutes = Math.abs(duration.minutes()) || 0;
  const seconds = Math.abs(duration.seconds()) || 0;

  if (!isAfter) {
    if (diffTime <= 0) {
      return {
        late: diffTime < 0,
        text: null,
      };
    }
    return {
      late: diffTime < 0,
      text:
        days === 0
          ? hours === 0
            ? minutes === 0
              ? `${seconds}s`
              : `${minutes}m ${seconds}s`
            : `${hours}h ${minutes}m ${seconds}s`
          : null,
    };
  }
  const revDiffTime = now.diff(date, 'millisecond');
  const revDuration = moment.duration(revDiffTime, 'milliseconds');
  const revDays = Math.abs(revDuration.days()) || 0;
  const revHours = Math.abs(revDuration.hours()) || 0;
  const revMinutes = Math.abs(revDuration.minutes()) || 0;
  const revSeconds = Math.abs(revDuration.seconds()) || 0;

  if (revDiffTime <= 0) {
    return {
      late: revDiffTime < 0,
      text: null,
    };
  }
  return {
    late: diffTime < 0,
    text:
      revDays === 0
        ? revHours === 0
          ? revMinutes === 0
            ? `${revSeconds}s`
            : `${revMinutes}m ${revSeconds}s`
          : `${revHours}h ${revMinutes}m ${revSeconds}s`
        : `${revDays}d ${revHours}h ${revMinutes}m ${revSeconds}s`,
  };
}
