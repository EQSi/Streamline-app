export class AuthController {
  googleCallback(req: any, res: any) {
    res.redirect('http://localhost:3000');
  }

  logout(req: any, res: any) {
    req.logout((err: any) => {
      if (err) {
        res.status(500).send('Error logging out');
      } else {
        res.redirect('/');
      }
    });
  }

  getUser(req: any, res: any) {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not authenticated');
    }
  }
}
