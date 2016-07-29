/**
 * Created by RajithaHasith on 29/07/2016.
 */
isArrayNull = function (inputArray) {
    for (var i = 0, len = inputArray.length; i < len; i += 1)
        if (inputArray[i] !== null)
            return false;
    return true;
};
