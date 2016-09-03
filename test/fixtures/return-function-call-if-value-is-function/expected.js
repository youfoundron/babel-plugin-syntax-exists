(() => {
  let func = () => true;
  return (typeof func === "function")
    ? func() : false
})()
