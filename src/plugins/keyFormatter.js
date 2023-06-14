const snakeCaseFormatter = (value, selectPosition) => {
    return {
        value: value.replace(/ /g, '_').toLowerCase(),
        selectPosition: selectPosition,
    }
}

const plainFormatter = (value, selectPosition) => {
    return {
        value, selectPosition
    }
}

// const keyFormatter = snakeCaseFormatter
const keyFormatter = plainFormatter

export default keyFormatter