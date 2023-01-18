const { createCanvas } = require('canvas')
// types colors
const colors = {
  'info' : '#3990EA',
  'correct' : '#32BEA6',
  'wrong' : '#E92F3D',
  'none' : '#696969',
  'title' : '#FFFFFF',
  'percentage': '#FFFFFF'
}
// unit with
const UNIT_WIDTH = 550
// unit padding
const UNIT_MARGINE = 20
// unit title size
const UNIT_TITLE = 24 
// unit percentage size
const UNIT_PERCENTAGE = 12
// unit circle size
const UNIT_CIRCLE = 24
// unit intervals
const UNIT_INTERVALS = 6
// unit progress height
const UNIT_PROGRESS_HEIGHT = 8
// unit max title
const UNIT_MAX_TITLE = 39
// unit height
const UNIT_HEIGHT = UNIT_TITLE + UNIT_INTERVALS + UNIT_CIRCLE + UNIT_MARGINE + UNIT_PROGRESS_HEIGHT

module.exports = async ({params, users}) => {
  let maxVotes = 0
  if (users) {
    users.forEach(p => maxVotes+= p.length)
  } else {
    users = []
    params.forEach(() => users.push([]))
  }

  const canvas = createCanvas(UNIT_WIDTH + UNIT_MARGINE * 2, UNIT_HEIGHT * params.length + UNIT_MARGINE * 2)
  const ctx = canvas.getContext('2d')
  // draw elements
  params.forEach(({isCorrect = 'info', value}, startPoint) => {
    createUnit(ctx, {
      type: isCorrect === false ? 'wrong' : isCorrect === true ? 'correct' : isCorrect,
      votes: users[startPoint].length,
      value, maxVotes, startPoint
    })
  });

  return canvas
}

function createUnit(ctx, {type, maxVotes, votes, value, startPoint}) {
  let point_up = UNIT_HEIGHT * startPoint
  let percentage = Math.trunc(votes/maxVotes*100)
  Number.isNaN(percentage) && (percentage = 0)
  // draw title
  point_up += UNIT_MARGINE + UNIT_TITLE // increment piont
  ctx.font = `bold ${UNIT_TITLE}px arial` // @@@ size correct
  ctx.fillStyle = colors['title'];
  ctx.fillText(value.length > UNIT_MAX_TITLE ? `${value.slice(0,UNIT_MAX_TITLE)}...` : value, UNIT_MARGINE, point_up)
  // draw circle
  point_up += UNIT_CIRCLE + UNIT_INTERVALS // increment piont
  const radius = UNIT_CIRCLE / 2 // circle radius
  ctx.fillStyle = colors[type]
  ctx.beginPath()
  ctx.arc(UNIT_MARGINE + radius, point_up - radius, radius, 0, 2 * Math.PI)
  ctx.fill()
  // draw percentage
  ctx.font = `bold ${UNIT_PERCENTAGE}px arial` // @@@ size correct
  ctx.fillStyle = colors['title'];
  ctx.fillText(`${percentage}%`, UNIT_MARGINE + UNIT_CIRCLE + UNIT_INTERVALS, point_up - UNIT_PERCENTAGE + radius / 2 / 2)
  // draw background for progress bar
  point_up+= UNIT_INTERVALS
  ctx.fillStyle = colors['none'];
  ctx.strokeStyle = colors['none'];
  ctx.beginPath();
  ctx.roundRect(UNIT_MARGINE, point_up, UNIT_WIDTH, UNIT_PROGRESS_HEIGHT, 4);
  ctx.stroke();
  ctx.fill()
  // draw progress bar
  if (percentage <= 0) return
  ctx.fillStyle = colors[type];
  ctx.strokeStyle = colors[type];
  ctx.beginPath();
  ctx.roundRect(UNIT_MARGINE, point_up, percentage * UNIT_WIDTH / 100, UNIT_PROGRESS_HEIGHT, 4);
  ctx.stroke();
  ctx.fill()
}