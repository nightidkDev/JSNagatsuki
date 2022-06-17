module.exports = {
  /**
   *
   * @param {String} value
   */
  getTime: function getTime(value) {
    if (!value.startsWith("{") || !value.endsWith("}")) return value;
    value = replaceAll(replaceAll(value, "{", ""), "}", "");

    let args = value.split(":");
    if (args.length == 0) return "Без даты";
    else if (args.length == 1) {
      if (args[0] == "date") {
        let date = new Date();
        let stringDate = `${date.getDate()}.${
          (date.getMonth() + 1).toString().length == 1
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1
        }.${date.getFullYear()} ${
          date.getHours().toString().length == 1
            ? "0" + date.getHours()
            : date.getHours()
        }:${
          date.getMinutes().toString().length == 1
            ? "0" + date.getMinutes()
            : date.getMinutes()
        }`;
        return stringDate;
      } else {
        return "Без даты";
      }
    } else {
      let timeplus = 0;

      const convert_time = {
        с: 1,
        s: 1,
        м: 60,
        m: 60,
        ч: 3600,
        h: 3600,
        д: 86400,
        d: 86400,
      };

      const regTime = new RegExp("[0-9]+[ДдDdЧчHhМмMmСсSs]", "g");
      const regNumber = new RegExp("[0-9]+", "g");
      let foundtime = [...args[1].matchAll(regTime)];
      for (let match of foundtime) {
        const matchValue = match[0];
        const textValue = (
          (matchValue || "s")[(matchValue?.length || 1) - 1] || "c"
        ).toLowerCase();
        timeplus +=
          parseInt((matchValue?.match(regNumber) || ["1"])[0] || "1") *
          convert_time[textValue];
      }
      timeplus *= 1000;
      if (args[0] == "date") {
        let date = new Date(new Date().getTime() + timeplus);
        let stringDate = `${date.getDate()}.${
          (date.getMonth() + 1).toString().length == 1
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1
        }.${date.getFullYear()} ${
          date.getHours().toString().length == 1
            ? "0" + date.getHours()
            : date.getHours()
        }:${
          date.getMinutes().toString().length == 1
            ? "0" + date.getMinutes()
            : date.getMinutes()
        }`;
        return stringDate;
      } else {
        return "Без даты.";
      }
    }
  },
  makeid: function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  /**
   *
   * @param {String} value
   * @param {String} change
   * @param {String} changer
   */
  replaceAll: replaceAll,

  getAuthor: function getAuthor(value, member) {
    if (!value.startsWith("{") || !value.endsWith("}")) return value;
    let valueNew = replaceAll(replaceAll(value, "{", ""), "}", "");

    if (valueNew != "member") return value;

    return member;
  },
};

function replaceAll(value, change, changer) {
  while (value.includes(change)) value = value.replace(change, changer);
  return value;
}
