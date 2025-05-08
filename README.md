# 📸 Photo Booth (with a twist!)

TLDR: a photo booth that gave everyone at the final showcase a momento of the showcase. Subjects are emojified and once you print the photo, you can scan the QR code / tap the NFC tag to see a timelapse of everything that was captured by the booth before hand. I built this for [DESINV 23](https://classes.berkeley.edu/content/2025-spring-desinv-23-1-lec-1), a class on creative programming & electronics at UC Berkeley.

https://github.com/user-attachments/assets/1dbe0838-6b98-46c2-8fa6-ebf771533a5d

# Showcase / description of finished piece

There are two components to this project that I want to discuss: the artwork being displayed on the screen and the printing process.

You'll notice that the artwork displayed is slightly inhuman. Just as they had been in my "balancing act" project, the figures in the artwork, aren't quite human they're stick figures. And they don't have faces, they have emojis. I gave them emojis as faces because I wanted to reflect the range of emotions people can be feeling. You really only ever see people smiling at photo booths. And I made them stick figures to engage people, I've noticed that people really enjoy using their body to control something that isn't exactly them. Meanwhile, people shrug when they just see themselves in the mirror. I noticed this with the balancing act project and I wanted to recreate that energy.

I wanted to create printed momentos because I really liked the idea of people having something they could take home and hang up on their wall. Throughout the semester I've been experimenting with this idea of collaborative art. That's where the idea of showing a timelapse of everything leading up to the photo being taken. Printed pages are somewhat limited but by sticking an NFC tag on the back I could make them interactive.

# Process

So the idea really started with the printing part of the project. I was a big fan of allowing people to print out a memonto and tap them to see a timelapse. The idea was flexible enough that it could work for any artwork (or essentially any visual artwork). So then the question was what should my art be?

My first idea was to do something like `r/place` but people could draw with their hands:

> My plan is to create a collaborative canvas where viewers can come up and use their hand to pain on the canvas (with controls for changing colour). After contributing to the canvas, they’ll get a printed NFC card with the artwork at its current state. When you scan your card with your phone it’ll lead to a website which plays back the history up until the point where this viewer made their contribution.

However, I tried it for a bit and I didn't find drawing with your hand to be very intuitive. So it was back to the drawing board. I had really enjoyed the p5.js balancing act project I had done so I thought I'd take inspiration from that and do a similar thing!

This was the balancing act project for reference:

<img width="564" alt="Screenshot 2025-05-07 at 7 24 26 PM" src="https://github.com/user-attachments/assets/e423f5cd-593a-4bec-9b9e-4f449f0c4eb3" />

I used a couple of things to build the project. The first thing was p5.js, which I used to create the artwork. I combined p5.js with ml5.js again, as I had done with the balancing act project. I used [PoseNet](https://blog.tensorflow.org/2018/05/real-time-human-pose-estimation-in.html) to do the pose detection and tracking.

To generate the timelapses, I need a bunch of images of the artwork over time. To acheive this, I'm sending an image every 10 seconds to an API route that saves the image in [Vercel Blob](https://vercel.com/docs/vercel-blob). I'm generating the pages to print using a webpage built in React that pulls from an API. When someone raises their hands (the trigger for taking the photo), it saves that timestamp and then that timestamp is rendered on the print page (a page I use to print the postcards). I'm working within the Next.js framework to created the React pages and the API routes.
