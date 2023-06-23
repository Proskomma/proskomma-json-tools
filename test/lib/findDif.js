export default function (eventsArray1, eventsArray2) {
    let error = []
    let throwError = false
    for (let i = 0; i < eventsArray1.length; i++) {
        if (eventsArray1[i] === eventsArray2[i]) {

            error.push(`\x1b[32m${eventsArray1[i]} ${eventsArray2[i]}\x1b[0m`)

        }
        else {
            error.push(`\x1b[31m${eventsArray1[i]} , ${eventsArray2[i]}\x1b[0m`)
            throwError = true
        }
    }

    if (throwError) {

        throw new Error('envents are not called on the same order or are not the same', error);
    }
    return;
}