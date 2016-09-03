(() => {
  let val = {
    parent: {
      child: "foo"
    }
  }
  return (typeof val.parent !== "undefined" && val.parent !== null)
    ? val.parent.child : false
})()
