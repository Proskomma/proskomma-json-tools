export default function (eventsArray) {
    const lengthArray = eventsArray.length
    let eventsArraysCopy = eventsArray
    const selfEndingEvents = ['text', 'mark', 'blockGraft', 'inlineGraft', 'metaContent']
    let i = 0
    let noProbleme = true
    let eventMissMatch = ''
    while (noProbleme) {
        if (eventsArraysCopy.length === 0) {
            noProbleme = false
            continue
        }

        let event = eventsArraysCopy.shift()
        if (selfEndingEvents.includes(event)) {
            //do nothing
        }
        else {
            let eventGlobal = ''
            if (event.includes('start')) {
                eventGlobal = event.split('start')[1]
                eventGlobal = `end${eventGlobal}`
            }
            else {
                eventGlobal = event.split('end')[1]
                eventGlobal = `start${eventGlobal}`
            }

            if (eventsArraysCopy.includes(eventGlobal)) {
                eventsArraysCopy.splice(eventsArraysCopy.indexOf(eventGlobal), 1)
            }
            else {
                eventMissMatch = event
                noProbleme = false
            }

        }

    }

    return { eventsArraysCopy, eventMissMatch }
}