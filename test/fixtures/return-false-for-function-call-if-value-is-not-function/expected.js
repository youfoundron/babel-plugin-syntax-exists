(() => {
  let func = "not a function";
  return (typeof func === "function")
    ? func() : false
})()
