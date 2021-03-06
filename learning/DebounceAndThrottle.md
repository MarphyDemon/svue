# 函数防抖(debounce)与函数节流(throttle)

## 概念

>函数防抖：当调用动作过n毫秒后，才会执行该动作，如在这n毫秒之内又调用此动作则将重新计算执行时间

例：比如搭乘电梯，当人进入电梯，需要十秒电梯启动，但是在此时间段内，又有人进入，则重新计时，无人进入，电梯启动。

>函数节流：预先设定一个执行周期，当调用动作的时刻大于等于执行周期则执行该动作，然后进入下一个新周期。

例：比如搭乘电梯，有人进入之后，十秒钟准时运送一次，这个时间从第一个上电梯的人开始计时，不等待，无人不运行。

[实例](http://demo.nimius.net/debounce_throttle/)

函数节流常用在频繁触发的事件中，如：resize，touchmove，mousemove，scroll。throttle会强制函数以固定的速率执行。因此这个方法比较适合动画相关的场景。

这方面想起原先做的动画，用到scroll监听页面滑动事件。