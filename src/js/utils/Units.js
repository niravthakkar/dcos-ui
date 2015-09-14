import Maths from "./Maths";

const Units = {
  formatResource: function (resource, value) {
    value = Maths.round(value, 2);

    if (resource !== "cpus") {
      value = Units.filesize(value * 1024 * 1024, 1);
    }

    return value;
  },

  filesize: function (size, decimals, threshold, multiplier, units) {
    size = size || 0;
    if (decimals == null) {
      decimals = 2;
    }
    threshold = threshold || 800; // Steps to next unit if exceeded
    multiplier = multiplier || 1024;
    units = units || ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

    var factorize = 1;
    var unitIndex;

    for (unitIndex = 0; unitIndex < units.length; unitIndex++) {
      if (unitIndex > 0) {
        factorize = Math.pow(multiplier, unitIndex);
      }

      if (size < multiplier * factorize && size < threshold * factorize) {
        break;
      }
    }

    if (unitIndex >= units.length) {
      unitIndex = units.length - 1;
    }

    var filesize = size / factorize;

    filesize = filesize.toFixed(decimals);

    // This removes unnecessary 0 or . chars at the end of the string/decimals
    if (filesize.indexOf(".") > -1) {
      filesize = filesize.replace(/\.?0*$/, "");
    }

    return filesize + " " + units[unitIndex];
  }
};

module.exports = Units;
